"use server";

import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { getSettings } from "@/lib/settings";
import { revalidatePath, revalidateTag } from "next/cache";
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
      return [];
    }

    // Return a flat list including soft-deleted comments (deletedAt !== null)
    // so the nesting structure is preserved. The client will render
    // "این نظر حذف شده است" for soft-deleted comments.
    return await prisma.comment.findMany({
      where: { postId: post.id, status: "approved" },
      orderBy: { createdAt: "asc" },
      include: { author: { select: { name: true, username: true, avatar: true, verifiedType: true, verifiedLabel: true } } },
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

// ─── Forum: accept / unaccept best answer ─────────────────────
// The topic creator (post.authorId) OR a super_admin can pick the best answer.
// Accepting marks the post solved (closes the topic) in the same transaction.

export async function acceptAnswerAction(commentId: string): Promise<{ ok: boolean; error?: string }> {
  const user = await getSessionUserPublic();
  if (!user) return { ok: false, error: "برای این کار ابتدا وارد شوید." };

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, postId: true, post: { select: { id: true, module: true, slug: true, authorId: true } } },
    });
    if (!comment || !comment.post) return { ok: false, error: "دیدگاه یافت نشد." };

    const post = comment.post;
    const isAuthor = post.authorId === user.id;
    const isAdmin = user.role === "super_admin";
    if (!isAuthor && !isAdmin) {
      return { ok: false, error: "فقط سازنده پرسش می‌تواند پاسخ برتر را انتخاب کند." };
    }
    // An author can't accept their own comment as best answer.
    const commentAuthor = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    });
    if (isAuthor && commentAuthor?.authorId === user.id) {
      return { ok: false, error: "نمی‌توانید پاسخ خودتان را به‌عنوان پاسخ برتر انتخاب کنید." };
    }

    await prisma.post.update({
      where: { id: post.id },
      data: { acceptedCommentId: comment.id, solved: true },
    });

    revalidatePath(`/${post.module}/${post.slug}`);
    revalidatePath(`/${post.module}`);
    revalidatePath(`/`);
    revalidateTag("home-data", "max");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "خطا در انتخاب پاسخ برتر" };
  }
}

export async function unacceptAnswerAction(postId: string): Promise<{ ok: boolean; error?: string }> {
  const user = await getSessionUserPublic();
  if (!user) return { ok: false, error: "برای این کار ابتدا وارد شوید." };

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, module: true, slug: true, authorId: true },
    });
    if (!post) return { ok: false, error: "پرسش یافت نشد." };

    const isAuthor = post.authorId === user.id;
    const isAdmin = user.role === "super_admin";
    if (!isAuthor && !isAdmin) {
      return { ok: false, error: "فقط سازنده پرسش می‌تواند این تغییر را انجام دهد." };
    }

    await prisma.post.update({
      where: { id: post.id },
      data: { acceptedCommentId: null, solved: false },
    });

    revalidatePath(`/${post.module}/${post.slug}`);
    revalidatePath(`/${post.module}`);
    revalidatePath(`/`);
    revalidateTag("home-data", "max");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "خطا در لغو پاسخ برتر" };
  }
}

/**
 * Forum-only: returns the topic meta needed by the comment section to render
 * the "accept best answer" controls (which comment is currently accepted, and
 * whether the current user is the topic author / admin). Safe to call on any
 * module; only forum posts will have acceptedCommentId set.
 */
export async function getForumTopicMetaAction(module: string, slug: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { module_slug: { module: module as any, slug } },
      select: { id: true, authorId: true, acceptedCommentId: true, module: true },
    });
    if (!post) return null;
    return post;
  } catch {
    return null;
  }
}
