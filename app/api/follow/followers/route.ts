import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return NextResponse.json({ users: [] });

  const followers = await prisma.follow.findMany({
    where: { followingId: user.id },
    include: { follower: true },
    take: 50,
  });

  return NextResponse.json({
    users: followers.map(f => ({
      id: f.follower.id,
      name: f.follower.name,
      username: f.follower.username,
      avatar: f.follower.avatar,
    })),
  });
}