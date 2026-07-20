import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const viewerId = searchParams.get("viewerId");

  if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return NextResponse.json({ users: [] });

  const followers = await prisma.follow.findMany({
    where: { followingId: user.id },
    include: { follower: true },
    take: 50,
  });

  const followerIds = followers.map((f) => f.follower.id);

  // In one query, find which of these followers the viewer already follows back
  let viewerFollowingSet = new Set<string>();
  if (viewerId && followerIds.length > 0) {
    const viewerFollows = await prisma.follow.findMany({
      where: { followerId: viewerId, followingId: { in: followerIds } },
      select: { followingId: true },
    });
    viewerFollowingSet = new Set(viewerFollows.map((f) => f.followingId));
  }

  return NextResponse.json({
    users: followers.map((f) => ({
      id: f.follower.id,
      name: f.follower.name,
      username: f.follower.username,
      avatar: f.follower.avatar,
      isFollowedByViewer: viewerFollowingSet.has(f.follower.id),
    })),
  });
}
