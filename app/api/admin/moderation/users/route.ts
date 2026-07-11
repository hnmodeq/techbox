import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { z } from "zod";

const patchSchema = z.object({ id: z.string().min(1), status: z.enum(["active", "banned", "suspended"]) });

async function requireSuperAdmin() {
  const user = await getSessionUserPublic();
  return user && user.role === "super_admin" ? user : null;
}

export async function GET() {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { username: "asc" }],
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      roleFa: true,
      status: true,
      avatar: true,
      _count: { select: { posts: true, comments: true, ratings: true } },
    },
  });
  return NextResponse.json(users);
}

export async function PATCH(req: NextRequest) {
  const current = await requireSuperAdmin();
  if (!current) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id, status } = patchSchema.parse(await req.json());
  if (id === current.id && status !== "active") {
    return NextResponse.json({ error: "cannot_ban_self" }, { status: 400 });
  }
  const updated = await prisma.user.update({ where: { id }, data: { status }, select: { id: true, username: true, status: true } });
  return NextResponse.json(updated);
}

export const dynamic = "force-dynamic";
