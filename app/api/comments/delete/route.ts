import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { z } from "zod";

const deleteSchema = z.object({
  commentId: z.string().min(1),
});

export async function PATCH(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user) {
    return NextResponse.json(
      { error: "unauthorized", message: "برای حذف نظر ابتدا وارد حساب کاربری شوید." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { commentId } = deleteSchema.parse(body);

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, authorId: true, deletedAt: true, replies: { where: { deletedAt: null }, take: 1, select: { id: true } } },
    });

    if (!comment || comment.deletedAt) {
      return NextResponse.json(
        { error: "not_found", message: "دیدگاه یافت نشد." },
        { status: 404 }
      );
    }

    // Only the author can delete their own comment
    if (comment.authorId !== user.id) {
      return NextResponse.json(
        { error: "forbidden", message: "شما فقط می‌توانید دیدگاه خود را حذف کنید." },
        { status: 403 }
      );
    }

    const hasReplies = comment.replies.length > 0;

    if (hasReplies) {
      // Soft delete: clear content but keep the structure so child replies remain visible
      await prisma.comment.update({
        where: { id: commentId },
        data: {
          text: "",
          deletedAt: new Date(),
          deletedBy: user.id,
        },
      });
    } else {
      // Hard delete: no replies, safe to remove completely
      await prisma.comment.delete({
        where: { id: commentId },
      });
    }

    return NextResponse.json({ ok: true, hasReplies });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "validation", message: "شناسه دیدگاه نامعتبر است." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }
}
