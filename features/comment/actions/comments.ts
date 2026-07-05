"use server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const postSchema = z.object({
  module: z.string(),
  slug: z.string(),
  text: z.string().min(2).max(2000),
  parentId: z.string().nullable().optional(),
});

export async function getCommentsAction(module: string, slug: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { module_slug: { module: module as any, slug } },
      select: { id: true }
    });
    if (post) {
      const comments = await prisma.comment.findMany({
        where: { postId: post.id },
        orderBy: { createdAt: "asc" },
        include: { replies: { orderBy: { createdAt: "asc" } } }
      });
      return comments;
    }
    return [];
  } catch (err) {
    return [];
  }
}

export async function createCommentAction(prevState: any, formData: FormData) {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, error: "برای ثبت نظر ابتدا باید وارد حساب کاربری خود شوید." };
  }

  const raw = {
    module: String(formData.get("module") || ""),
    slug: String(formData.get("slug") || ""),
    text: String(formData.get("text") || ""),
    parentId: formData.get("parentId") ? String(formData.get("parentId")) : null,
  };

  try {
    const { module, slug, text, parentId } = postSchema.parse(raw);
    let post = await prisma.post.findUnique({
      where: { module_slug: { module: module as any, slug } }
    });
    if (!post) {
      post = await prisma.post.create({
        data: {
          module,
          slug,
          title: slug,
          authorName: "تحریریه",
          dateFa: "۱۴۰۵",
          published: true
        }
      });
    }

    await prisma.comment.create({
      data: {
        postId: post.id,
        parentId,
        authorId: user.id,
        authorName: user.name || user.username,
        text
      }
    });

    revalidatePath(`/${module}/${slug}`);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}