import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth-server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail, emailTemplates } from "@/lib/email";

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

  try {
    const post = await prisma.post.findUnique({
      where: { module_slug: { module: postModule as any, slug } },
      select: { id: true },
    });
    if (!post) return NextResponse.json([]);

    const comments = await prisma.comment.findMany({
      where: { postId: post.id, status: "approved", deletedAt: null },
      orderBy: { createdAt: "asc" },
      include: { author: { select: { name: true, username: true, avatar: true } }, replies: { where: { status: "approved" }, orderBy: { createdAt: "asc" }, include: { author: { select: { name: true, username: true, avatar: true } } } } },
    });
    return NextResponse.json(comments);
  } catch {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "unauthorized", message: "برای ثبت نظر ابتدا وارد حساب کاربری شوید." },
      { status: 401 }
    );
  }
  if ((user as any).status === "banned" || (user as any).status === "suspended") {
    return NextResponse.json({ error: "forbidden", message: "حساب شما اجازه ثبت دیدگاه ندارد." }, { status: 403 });
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

    const comment = await prisma.comment.create({
      data: {
        postId: post.id,
        parentId: parentId || null,
        authorId: user.id,
        authorName: user.name || user.username,
        text,
      },
    });

    // Send email notification to post author (if available)
    if (post.authorId) {
      const postAuthor = await prisma.user.findUnique({
        where: { id: post.authorId },
        select: { email: true, name: true },
      });

      if (postAuthor?.email) {
        const { subject, html } = emailTemplates.newComment({
          postTitle: post.title,
          postUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://techbox.local"}/${postModule}/${postSlug}`,
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