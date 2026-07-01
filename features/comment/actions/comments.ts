"use server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const postSchema = z.object({
 module: z.string(),
 slug: z.string(),
 text: z.string().min(2).max(2000),
 authorName: z.string().optional(),
 parentId: z.string().nullable().optional(),
});

export async function getCommentsAction(module: string, slug: string){
 const post = await prisma.post.findUnique({
 where: { module_slug: { module: module as any, slug } },
 select: { id: true }
 });
 if(!post) return [];
 const comments = await prisma.comment.findMany({
 where: { postId: post.id },
 orderBy: { createdAt: "asc" },
 include: { replies: { orderBy: { createdAt: "asc" } } }
 });
 return comments;
}

export async function createCommentAction(prevState: any, formData: FormData){
 const user = await getSessionUser();
 const raw = {
 module: String(formData.get("module")||""),
 slug: String(formData.get("slug")||""),
 text: String(formData.get("text")||""),
 authorName: String(formData.get("authorName")||""),
 parentId: formData.get("parentId") ? String(formData.get("parentId")) : null,
 };
 try{
 const { module, slug, text, authorName, parentId } = postSchema.parse(raw);
 const post = await prisma.post.findUnique({
 where: { module_slug: { module: module as any, slug } }
 });
 if(!post) return { ok:false, error:"post_not_found" };
 await prisma.comment.create({
 data: {
 postId: post.id,
 parentId,
 authorId: user?.id || null,
 authorName: user?.name || authorName || "مهمان",
 text
 }
 });
 revalidatePath(`/${module}/${slug}`);
 return { ok: true };
 }catch(e:any){
 return { ok:false, error: e.message };
 }
}

export async function voteCommentAction(commentId: string, vote: 1|-1|0, fingerprint: string){
 "use server";
 const existing = await prisma.commentVote.findUnique({
 where: { fingerprint_commentId: { fingerprint, commentId } }
 });
 const oldV = existing?.vote ?? 0;
 if(vote === oldV){ // toggle off handled by caller sending 0
 }
 if(vote === 0){
 if(existing){
 await prisma.$transaction([
 prisma.commentVote.delete({ where:{ id: existing.id }}),
 prisma.comment.update({
 where:{ id: commentId },
 data:{
 likes: { decrement: existing.vote===1?1:0 },
 dislikes: { decrement: existing.vote===-1?1:0 }
 }
 })
 ]);
 }
 } else {
 await prisma.$transaction(async tx=>{
 if(existing){
 await tx.commentVote.update({ where:{id: existing.id}, data:{ vote }});
 await tx.comment.update({
 where:{id: commentId},
 data:{
 likes: { increment: (vote===1?1:0) - (oldV===1?1:0) },
 dislikes: { increment: (vote===-1?1:0) - (oldV===-1?1:0) }
 }
 });
 } else {
 await tx.commentVote.create({ data:{ commentId, fingerprint, vote }});
 await tx.comment.update({
 where:{id: commentId},
 data:{
 likes: { increment: vote===1?1:0 },
 dislikes: { increment: vote===-1?1:0 }
 }
 });
 }
 });
 }
 const c = await prisma.comment.findUnique({ where:{id:commentId}, select:{likes:true, dislikes:true}});
 revalidatePath("/", "layout");
 return c;
}
