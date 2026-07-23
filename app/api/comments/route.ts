import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getSessionUserPublic } from "@/lib/auth-server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail, emailTemplates } from "@/lib/email";
import { getSettings } from "@/lib/settings";

const postSchema = z.object({
  postModule: z.string(),
  postSlug: z.string(),
  text: z.string().min(2).max(2000),
  authorName: z.string().min(1).max(60).optional(),
  parentId: z.string().nullable().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postModule = searchParams.get("module");
  const slug = searchParams.get("slug");
  if (!postModule || !slug)
    return NextResponse.json({ error: "module+slug required" }, { status: 400 });

  // Check if comments are hidden globally
  const settings = await getSettings(["comments.hidden_globally"]);
  if (settings["comments.hidden_globally"] === "true") {
    return NextResponse.json([], { headers: { "X-Comments-Hidden": "true" } });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { module_slug: { module: postModule as any, slug } },
      select: { id: true },
    });
    if (!post) return NextResponse.json([]);

    // Include soft-deleted comments so the nesting structure is preserved.
    // Client renders "این نظر حذف شده است" for soft-deleted comments.
    const comments = await prisma.comment.findMany({
      where: { postId: post.id, parentId: null, status: "approved" },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { name: true, username: true, avatar: true } },
        replies: {
          where: { status: "approved" },
          orderBy: { createdAt: "asc" },
          include: { author: { select: { name: true, username: true, avatar: true } } },
        },
      },
    });
    return NextResponse.json(comments);
  } catch {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user) {
    return NextResponse.json(
      { error: "unauthorized", message: "برای ثبت نظر ابتدا وارد حساب کاربری شوید." },
      { status: 401 }
    );
  }

  // Check if user is muted
  if (user.status === "muted") {
    const stillMuted = !user.mutedUntil || new Date(user.mutedUntil) > new Date();
    if (stillMuted) {
      return NextResponse.json(
        { error: "muted", message: "حساب شما در حالت سکوت است. امکان ثبت دیدگاه وجود ندارد." },
        { status: 403 }
      );
    }
  }

  // Check if comments are hidden globally — block new comments
  const settings = await getSettings(["comments.hidden_globally", "comments.mode"]);
  if (settings["comments.hidden_globally"] === "true") {
    return NextResponse.json(
      { error: "comments_disabled", message: "دیدگاه‌ها موقتاً غیرفعال شده‌اند." },
      { status: 403 }
    );
  }

  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(`${user.id}:${ip}`, "comments");

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "too_many_requests", message: "تعداد دیدگاه‌های ارسالی بیش از حد مجاز است." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { postModule, postSlug, text, parentId } = postSchema.parse(body);

    let post = await prisma.post.findUnique({
      where: { module_slug: { module: postModule as any, slug: postSlug } },
    });
    if (!post) {
      return NextResponse.json({ error: "post_not_found", message: "مطلب مورد نظر یافت نشد." }, { status: 404 });
    }

    // Determine comment status based on policy
    const commentMode = settings["comments.mode"] || "auto_approve";
    const status = commentMode === "require_approval" ? "pending" : "approved";

    const comment = await prisma.comment.create({
      data: {
        postId: post.id,
        parentId: parentId || null,
        authorId: user.id,
        authorName: user.name || user.username,
        text,
        status,
      },
    });

    // Send email notification to post author (if available) only for approved comments
    if (status === "approved" && post.authorId) {
      const postAuthor = await prisma.user.findUnique({
        where: { id: post.authorId },
        select: { email: true, name: true },
      });

      if (postAuthor?.email) {
        const { subject, html } = emailTemplates.newComment({
          postTitle: post.title,
          postUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/${postModule}/${postSlug}`,
          commentAuthor: user.name || user.username,
          commentText: text,
        });

        await sendEmail({
          to: postAuthor.email,
          subject,
          html,
        });
      }
    }

    return NextResponse.json(comment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
