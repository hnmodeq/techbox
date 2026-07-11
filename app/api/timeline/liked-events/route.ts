import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";

/**
 * Returns the set of timeline event IDs the CURRENT user has liked, in a
 * single query. This replaces the previous pattern where TimelineCard
 * fired its own GET /api/timeline/like?eventId=X for every card on the
 * page (N events -> N requests) just to find out which ones were already
 * liked by this user. Public like counts and comments are already
 * included in the bulk GET /api/timeline/events payload.
 */
export async function GET() {
  const user = await getSessionUserPublic();
  if (!user) {
    return NextResponse.json({ likedEventIds: [], isLoggedIn: false });
  }

  const likes = await prisma.timelineLike.findMany({
    where: { fingerprint: user.id },
    select: { eventId: true }
  });

    return NextResponse.json({
      likedEventIds: likes.map((l: any) => l.eventId),
    isLoggedIn: true
  });
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
