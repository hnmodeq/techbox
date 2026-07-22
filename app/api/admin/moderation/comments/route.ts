import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { logAudit } from "@/lib/audit-log";
import { z } from "zod";

const statusSchema = z.enum(["approved", "pending", "hidden", "spam"]);
const patchSchema = z.object({ id: z.string().min(1), status: statusSchema });

async function requireAdmin() {
  const user = await getSessionUserPublic();
  return user && ["super_admin", "editor"].includes(user.role) ? user : null;
}

export async function GET(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "all";
  const take = Math.min(Number(searchParams.get("take") || 100), 200);

  const comments = await prisma.comment.findMany({
    where: status === "all" ? {} : { status },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      author: { select: { id: true, name: true, username: true, avatar: true, status: true, verifiedType: true, verifiedLabel: true } },
      post: { select: { id: true, module: true, slug: true, title: true } },
    },
  });
  return NextResponse.json(comments);
}

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id, status } = patchSchema.parse(await req.json());
  const updated = await prisma.comment.update({ where: { id }, data: { status } });
  logAudit({ userId: user.id, userName: user.name, action: "comment.status", target: `comment:${id}`, details: { newStatus: status } });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const user = await requireAdmin();
  if (!user || user.role !== "super_admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });
  await prisma.comment.delete({ where: { id } });
  logAudit({ userId: user.id, userName: user.name, action: "comment.delete", target: `comment:${id}` });
  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
