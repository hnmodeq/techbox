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

  const following = await prisma.follow.findMany({
    where: { followerId: user.id, following: { status: "active" } },
    select: {
      following: {
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
      verifiedType: f.following.verifiedType ?? null,
      verifiedLabel: f.following.verifiedLabel ?? null,
      isFollowedByViewer: viewerFollowingSet.has(f.following.id),
    })),
  });
}

export const dynamic = "force-dynamic";
