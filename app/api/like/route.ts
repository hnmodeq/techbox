import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
 module: z.enum(["blog","news","media","review","tools","download","shop","forum"]),
 slug: z.string().min(1),
 fingerprint: z.string().min(3)
});

export async function POST(req: NextRequest){
 try{
 const body = await req.json();
 const { module, slug, fingerprint } = schema.parse(body);

 const existing = await prisma.like.findUnique({
 where: { fingerprint_module_slug: { fingerprint, module: module as any, slug } }
 });

 if(existing){
 await prisma.like.delete({ where: { id: existing.id }});
 await prisma.post.updateMany({
 where: { module: module as any, slug },
 data: { likes: { decrement: 1 } }
 });
 const p = await prisma.post.findFirst({ where: { module: module as any, slug }, select: { likes: true }});
 return NextResponse.json({ liked: false, likes: Math.max(0, p?.likes ?? 0) });
 } else {
 await prisma.like.create({ data: { fingerprint, module: module as any, slug }});
 await prisma.post.updateMany({
 where: { module: module as any, slug },
 data: { likes: { increment: 1 } }
 });
 const p = await prisma.post.findFirst({ where: { module: module as any, slug }, select: { likes: true }});
 return NextResponse.json({ liked: true, likes: p?.likes ?? 1 });
 }
 }catch(e:any){
 return NextResponse.json({ error: e.message }, { status: 400 });
 }
}
