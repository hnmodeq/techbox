import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/api-permissions";
import { logAudit } from "@/lib/audit-log";
import { z } from "zod";

const statusSchema = z.enum(["approved", "pending", "hidden", "spam"]);
const patchSchema = z.object({ id: z.string().min(1), status: statusSchema });

export async function GET(req: NextRequest) {
  const user = await requirePermission("comment:view");
  if (user instanceof NextResponse) return user;

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
  const user = await requirePermission("comment:moderate");
  if (user instanceof NextResponse) return user;
  const { id, status } = patchSchema.parse(await req.json());
  const updated = await prisma.comment.update({ where: { id }, data: { status } });
  void logAudit({ userId: user.id, userName: user.name, action: "comment.status", target: `comment:${id}`, details: { newStatus: status } });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const user = await requirePermission("comment:moderate");
  if (user instanceof NextResponse) return user;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });
  await prisma.comment.delete({ where: { id } });
  void logAudit({ userId: user.id, userName: user.name, action: "comment.delete", target: `comment:${id}` });
  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
