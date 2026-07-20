import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  const viewer = await getSessionUserPublic();
  if (!viewer) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { targetUserId } = await req.json();

  if (viewer.id === targetUserId) {
    return NextResponse.json({ error: "cannot follow yourself" }, { status: 400 });
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: viewer.id,
        followingId: targetUserId,
      },
    },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ following: false });
  } else {
    await prisma.follow.create({
      data: {
        followerId: viewer.id,
        followingId: targetUserId,
      },
    });
    return NextResponse.json({ following: true });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 });

  const [followersCount, followingCount] = await Promise.all([
    prisma.follow.count({ where: { followingId: user.id } }),
    prisma.follow.count({ where: { followerId: user.id } }),
  ]);

  return NextResponse.json({ followersCount, followingCount });
}