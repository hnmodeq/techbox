import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";
import { z } from "zod";

const schema = z.object({
  commentId: z.string(),
  vote: z.union([z.literal(1), z.literal(-1), z.literal(0)])
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { commentId, vote } = schema.parse(await req.json());
    const fingerprint = user.id;

    const existing = await prisma.commentVote.findUnique({
      where: { fingerprint_commentId: { fingerprint, commentId } }
    });

    async function adjust(oldV: number, newV: number) {
      if (oldV === newV) return;
      const incLikes = (newV === 1 ? 1 : 0) - (oldV === 1 ? 1 : 0);
      const incDislikes = (newV === -1 ? 1 : 0) - (oldV === -1 ? 1 : 0);
      if (incLikes !== 0 || incDislikes !== 0) {
        await prisma.comment.update({
          where: { id: commentId },
          data: { likes: { increment: incLikes }, dislikes: { increment: incDislikes } }
        });
      }
    }

    if (vote === 0) {
      if (existing) {
        await adjust(existing.vote, 0);
        await prisma.commentVote.delete({ where: { id: existing.id } });
      }
    } else {
      if (existing) {
        await adjust(existing.vote, vote);
        await prisma.commentVote.update({ where: { id: existing.id }, data: { vote } });
      } else {
        await prisma.commentVote.create({ data: { commentId, fingerprint, vote } });
        await adjust(0, vote);
      }
    }

    const c = await prisma.comment.findUnique({ where: { id: commentId }, select: { likes: true, dislikes: true } });
    return NextResponse.json(c || { likes: 0, dislikes: 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
