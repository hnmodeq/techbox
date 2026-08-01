import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { z } from "zod";

const schema = z.object({
  commentId: z.string(),
  vote: z.union([z.literal(1), z.literal(-1), z.literal(0)])
});

export async function GET(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user) {
    return NextResponse.json({ voted: false });
  }

  const { searchParams } = new URL(req.url);

  // Bulk form: ?commentIds=a,b,c
  //
  // Every CommentVote button used to fetch its own state on mount, so a
  // thread of 20 comments fired 20 requests, each doing a session lookup
  // plus two queries — 60 queries to render one page. On a small pool that
  // is a reliable P2024, and the log showed these taking 2-3s apiece.
  const bulk = searchParams.get("commentIds");
  if (bulk) {
    const ids = bulk.split(",").map((id) => id.trim()).filter(Boolean).slice(0, 100);
    if (ids.length === 0) return NextResponse.json({ votes: {} });
    try {
      const [votes, comments] = await Promise.all([
        prisma.commentVote.findMany({
          where: { fingerprint: user.id, commentId: { in: ids }, vote: 1 },
          select: { commentId: true },
        }),
        prisma.comment.findMany({
          where: { id: { in: ids } },
          select: { id: true, likes: true },
        }),
      ]);
      const voted = new Set(votes.map((v) => v.commentId));
      const result: Record<string, { voted: boolean; likes: number }> = {};
      for (const comment of comments) {
        result[comment.id] = {
          voted: voted.has(comment.id),
          likes: Math.max(0, comment.likes ?? 0),
        };
      }
      return NextResponse.json({ votes: result });
    } catch {
      return NextResponse.json({ votes: {} });
    }
  }

  const commentId = searchParams.get("commentId");
  if (!commentId) {
    return NextResponse.json({ error: "commentId required" }, { status: 400 });
  }

  try {
    const existing = await prisma.commentVote.findUnique({
      where: { fingerprint_commentId: { fingerprint: user.id, commentId } },
    });
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { likes: true },
    });
    return NextResponse.json({
      voted: existing?.vote === 1,
      likes: Math.max(0, comment?.likes ?? 0),
    });
  } catch {
    return NextResponse.json({ voted: false });
  }
}

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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_vote", issues: error.issues }, { status: 400 });
    }
    console.error("[comments:vote]", error);
    return NextResponse.json({ error: "vote_failed" }, { status: 500 });
  }
}
