import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { z } from "zod";

const schema = z.object({
  commentId: z.string(),
  vote: z.union([z.literal(1), z.literal(-1), z.literal(0)])
});

export async function POST(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { commentId, vote } = schema.parse(await req.json());
    const fingerprint = user.id;

    const existing = await prisma.commentVote.findUnique({
      where: { fingerprint_commentId: { fingerprint, commentId } }
    });

    function delta(oldV: number, newV: number) {
      if (oldV === newV) return { incLikes: 0, incDislikes: 0 };
      const incLikes = (newV === 1 ? 1 : 0) - (oldV === 1 ? 1 : 0);
      const incDislikes = (newV === -1 ? 1 : 0) - (oldV === -1 ? 1 : 0);
      return { incLikes, incDislikes };
    }

    if (vote === 0) {
      if (existing) {
        const { incLikes, incDislikes } = delta(existing.vote, 0);
        if (incLikes !== 0 || incDislikes !== 0) {
          await prisma.$transaction([
            prisma.commentVote.delete({ where: { id: existing.id } }),
            prisma.comment.update({
              where: { id: commentId },
              data: {
                likes: { increment: incLikes },
                dislikes: { increment: incDislikes },
              },
            }),
          ]);
        } else {
          await prisma.commentVote.delete({ where: { id: existing.id } });
        }
      }
    } else {
      if (existing) {
        const { incLikes, incDislikes } = delta(existing.vote, vote);
        if (incLikes !== 0 || incDislikes !== 0) {
          await prisma.$transaction([
            prisma.commentVote.update({ where: { id: existing.id }, data: { vote } }),
            prisma.comment.update({
              where: { id: commentId },
              data: {
                likes: { increment: incLikes },
                dislikes: { increment: incDislikes },
              },
            }),
          ]);
        } else {
          await prisma.commentVote.update({ where: { id: existing.id }, data: { vote } });
        }
      } else {
        const { incLikes, incDislikes } = delta(0, vote);
        if (incLikes !== 0 || incDislikes !== 0) {
          await prisma.$transaction([
            prisma.commentVote.create({ data: { commentId, fingerprint, vote } }),
            prisma.comment.update({
              where: { id: commentId },
              data: {
                likes: { increment: incLikes },
                dislikes: { increment: incDislikes },
              },
            }),
          ]);
        } else {
          await prisma.commentVote.create({ data: { commentId, fingerprint, vote } });
        }
      }
    }

    const c = await prisma.comment.findUnique({ where: { id: commentId }, select: { likes: true, dislikes: true } });
    return NextResponse.json({
      likes: Math.max(0, c?.likes ?? 0),
      dislikes: Math.max(0, c?.dislikes ?? 0),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "vote_failed" }, { status: 400 });
  }
}
