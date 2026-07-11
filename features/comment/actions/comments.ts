"use server";

import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { getSettings } from "@/lib/settings";
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
    const settings = await getSettings(["comments.hidden_globally"]);
    if (settings["comments.hidden_globally"] === "true") return [];

    const post = await prisma.post.findUnique({
      where: { module_slug: { module: module as any, slug } },
      select: { id: true },
    });
    if (!post) {
      // Post exists in the DB only after it has been seeded/created; until then
      // there are simply no comments yet (we no longer fabricate mock ones).
      return [];
    }

    // Return a flat list. CommentSection nests it client-side, which avoids
    // duplicate replies appearing both as root comments and nested replies.
    return await prisma.comment.findMany({
      where: { postId: post.id, status: "approved", deletedAt: null },
      orderBy: { createdAt: "asc" },
      include: { author: { select: { name: true, username: true, avatar: true } } },
    });
  } catch {
    return [];
  }
}

export async function createCommentAction(prevState: any, formData: FormData) {
  const user = await getSessionUserPublic();
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
    const settings = await getSettings(["comments.hidden_globally", "comments.mode"]);

    if (settings["comments.hidden_globally"] === "true") {
      return { ok: false, error: "دیدگاه‌ها موقتاً غیرفعال شده‌اند." };
    }

    const post = await prisma.post.findUnique({
      where: { module_slug: { module: module as any, slug } },
      select: { id: true },
    });
    if (!post) {
      return { ok: false, error: "مطلب مورد نظر یافت نشد." };
    }

    const status = settings["comments.mode"] === "require_approval" ? "pending" : "approved";

    await prisma.comment.create({
      data: {
        postId: post.id,
        parentId,
        authorId: user.id,
        authorName: user.name || user.username,
        text,
        status,
      },
    });

    revalidatePath(`/${module}/${slug}`);
    return {
      ok: true,
      pending: status === "pending",
      message:
        status === "pending"
          ? "دیدگاه شما ثبت شد و پس از تأیید مدیر نمایش داده می‌شود."
          : "دیدگاه شما با موفقیت ثبت شد.",
    };
  } catch (e: any) {
    return { ok: false, error: e?.message || "خطا در ثبت دیدگاه" };
  }
}
