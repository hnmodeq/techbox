import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return NextResponse.json({ users: [] });

  const following = await prisma.follow.findMany({
    where: { followerId: user.id },
    include: { following: true },
    take: 50,
  });

  return NextResponse.json({
    users: following.map(f => ({
      id: f.following.id,
      name: f.following.name,
      username: f.following.username,
      avatar: f.following.avatar,
    })),
  });
}