import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { z } from "zod";

const editSchema = z.object({
  commentId: z.string().min(1),
  text: z.string().min(2).max(2000),
});

export async function PATCH(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user) {
    return NextResponse.json(
      { error: "unauthorized", message: "برای ویرایش نظر ابتدا وارد حساب کاربری شوید." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { commentId, text } = editSchema.parse(body);

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, authorId: true, deletedAt: true },
    });

    if (!comment || comment.deletedAt) {
      return NextResponse.json(
        { error: "not_found", message: "دیدگاه یافت نشد." },
        { status: 404 }
      );
    }

    // Only the author can edit their own comment
    if (comment.authorId !== user.id) {
      return NextResponse.json(
        { error: "forbidden", message: "شما فقط می‌توانید دیدگاه خود را ویرایش کنید." },
        { status: 403 }
      );
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: {
        text,
        editedAt: new Date(),
      },
      include: { author: { select: { name: true, username: true, avatar: true } } },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "validation", message: "متن دیدگاه باید بین ۲ تا ۲۰۰۰ حرف باشد." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }
}
