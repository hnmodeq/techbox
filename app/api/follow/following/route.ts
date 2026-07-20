import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const viewerId = searchParams.get("viewerId");

  if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return NextResponse.json({ users: [] });

  const following = await prisma.follow.findMany({
    where: { followerId: user.id },
    include: { following: true },
    take: 50,
  });

  const followingIds = following.map((f) => f.following.id);

  // In one query, find which of these users the viewer already follows
  let viewerFollowingSet = new Set<string>();
  if (viewerId && followingIds.length > 0) {
    const viewerFollows = await prisma.follow.findMany({
      where: { followerId: viewerId, followingId: { in: followingIds } },
      select: { followingId: true },
    });
    viewerFollowingSet = new Set(viewerFollows.map((f) => f.followingId));
  }

  return NextResponse.json({
    users: following.map((f) => ({
      id: f.following.id,
      name: f.following.name,
      username: f.following.username,
      avatar: f.following.avatar,
      isFollowedByViewer: viewerFollowingSet.has(f.following.id),
    })),
  });
}
