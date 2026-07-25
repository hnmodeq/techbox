import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";

const followSchema = z.object({ targetUserId: z.string().min(1).max(100) });

export async function POST(req: NextRequest) {
  const viewer = await getSessionUserPublic();
  if (!viewer) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rateLimit = await checkRateLimit(`${viewer.id}:${getClientIp(req)}`, "follow");
  if (!rateLimit.success) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }

  const parsed = followSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_target" }, { status: 400 });
  }
  const { targetUserId } = parsed.data;

  if (viewer.id === targetUserId) {
    return NextResponse.json({ error: "cannot follow yourself" }, { status: 400 });
  }

  const target = await prisma.user.findFirst({
    where: { id: targetUserId, status: "active" },
    select: { id: true },
  });
  if (!target) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
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
  const viewer = await getSessionUserPublic();
  const viewerId = viewer?.id;

  if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });

  const user = await prisma.user.findFirst({
    where: { username, status: "active" },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 });

  const [followersCount, followingCount, isFollowing] = await Promise.all([
    prisma.follow.count({ where: { followingId: user.id } }).catch(() => 0),
    prisma.follow.count({ where: { followerId: user.id } }).catch(() => 0),
    viewerId && viewerId !== user.id
      ? prisma.follow
          .findUnique({
            where: {
              followerId_followingId: {
                followerId: viewerId,
                followingId: user.id,
              },
            },
          })
          .then((r) => !!r)
          .catch(() => false)
      : Promise.resolve(false),
  ]);

  return NextResponse.json({ followersCount, followingCount, isFollowing });
}

export const dynamic = "force-dynamic";
