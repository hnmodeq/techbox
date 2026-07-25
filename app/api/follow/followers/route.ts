import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const viewer = await getSessionUserPublic();
  const viewerId = viewer?.id;

  if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });

  const user = await prisma.user.findFirst({
    where: { username, status: "active" },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ users: [] });

  const followers = await prisma.follow.findMany({
    where: { followingId: user.id, follower: { status: "active" } },
    select: {
      follower: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          verifiedType: true,
          verifiedLabel: true,
        },
      },
    },
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
      verifiedType: f.follower.verifiedType ?? null,
      verifiedLabel: f.follower.verifiedLabel ?? null,
      isFollowedByViewer: viewerFollowingSet.has(f.follower.id),
    })),
  });
}

export const dynamic = "force-dynamic";
