import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, canEditModule } from "@/lib/auth-server";
import { z } from "zod";

export async function GET(req: NextRequest){
 const { searchParams } = new URL(req.url);
 const postModule = searchParams.get("module") || undefined;
 const take = Math.min(parseInt(searchParams.get("take") || "50"), 100);
 const posts = await prisma.post.findMany({
 where: { published: true, ...(postModule ? { module: postModule as any } : {}) },
 orderBy: { date: "desc" },
 take,
 select: {
 slug: true, module: true, title: true, excerpt: true, image: true,
 tags: true, date: true, dateFa: true, likes: true, views: true,
 category: true, authorName: true
 }
 });
 const out = posts.map(p => ({ ...p, tags: JSON.parse(p.tags || "[]"), author: { name: p.authorName }}));
 return NextResponse.json(out);
}

const createSchema = z.object({
 module: z.enum(["blog","news","media","review","tools","download","shop","forum"]),
 slug: z.string().min(2),
 title: z.string().min(3),
 excerpt: z.string().default(""),
 content: z.string().default(""),
 image: z.string().optional(),
 tags: z.array(z.string()).default([]),
 category: z.string().optional()
});

export async function POST(req: NextRequest){
 const user = await getSessionUser();
 if(!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
 const data = createSchema.parse(await req.json());
 if(!canEditModule(user as any, data.module)){
 return NextResponse.json({ error: "forbidden" }, { status: 403 });
 }
 try{
 const post = await prisma.post.create({
 data: {
 ...data,
 tags: JSON.stringify(data.tags),
 authorId: user.id,
 authorName: user.name,
 dateFa: new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date()),
 }
 });
 return NextResponse.json(post, { status: 201 });
 }catch(e:any){
 if(String(e.message).includes("Unique")) return NextResponse.json({ error: "slug exists" }, { status: 409 });
 return NextResponse.json({ error: e.message }, { status: 400 });
 }
}
