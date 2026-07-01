import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth-server";

const postSchema = z.object({
 postModule: z.string(),
 postSlug: z.string(),
 text: z.string().min(2).max(2000),
 authorName: z.string().min(1).max(60).optional(),
 parentId: z.string().nullable().optional()
});

export async function GET(req: NextRequest){
 const { searchParams } = new URL(req.url);
 const postModule = searchParams.get("module");
 const slug = searchParams.get("slug");
 if(!postModule || !slug) return NextResponse.json({ error: "module+slug required" }, { status: 400 });

 const post = await prisma.post.findUnique({ where: { module_slug: { module: postModule as any, slug } }, select: { id: true }});
 if(!post) return NextResponse.json([]);
 
 const comments = await prisma.comment.findMany({
 where: { postId: post.id },
 orderBy: { createdAt: "asc" },
 include: { replies: { orderBy: { createdAt: "asc" } } }
 });
 // return flat, client will nest
 return NextResponse.json(comments);
}

export async function POST(req: NextRequest){
 const user = await getSessionUser();
 const body = await req.json();
 const { postModule, postSlug, text, authorName, parentId } = postSchema.parse(body);

 const post = await prisma.post.findUnique({
 where: { module_slug: { module: postModule as any, slug: postSlug } }
 });
 if(!post) return NextResponse.json({ error: "post not found" }, { status: 404 });

 const comment = await prisma.comment.create({
 data: {
 postId: post.id,
 parentId: parentId || null,
 authorId: user?.id || null,
 authorName: user?.name || authorName || "مهمان",
 text
 }
 });
 return NextResponse.json(comment, { status: 201 });
}
