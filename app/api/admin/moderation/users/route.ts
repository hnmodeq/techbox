import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { logAudit } from "@/lib/audit-log";
import { z } from "zod";

const muteSchema = z.object({
  id: z.string().min(1),
  action: z.literal("mute"),
  mutedUntil: z.string().optional(), // ISO date string, empty = permanent
  reason: z.string().max(500).optional(),
});

const banSchema = z.object({
  id: z.string().min(1),
  action: z.literal("ban"),
  reason: z.string().max(500).optional(),
});

const unmuteSchema = z.object({
  id: z.string().min(1),
  action: z.literal("unmute"),
});

const unbanSchema = z.object({
  id: z.string().min(1),
  action: z.literal("unban"),
});

const ipBanSchema = z.object({
  action: z.literal("ip_ban"),
  ip: z.string().min(1),
  reason: z.string().max(500).optional(),
  userId: z.string().optional(), // ban the user's last known IP
});

const ipUnbanSchema = z.object({
  action: z.literal("ip_unban"),
  ip: z.string().min(1),
});

const actionSchema = z.discriminatedUnion("action", [
  muteSchema, banSchema, unmuteSchema, unbanSchema, ipBanSchema, ipUnbanSchema,
]);

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
      id: true, name: true, username: true, email: true,
      role: true, roleFa: true, status: true, avatar: true,
      mutedUntil: true, bannedAt: true, banReason: true,
      verifiedType: true, verifiedLabel: true,
      _count: { select: { posts: true, comments: true, ratings: true } },
    },
  });

  const ipBans = await prisma.ipBan.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ users, ipBans });
}

export async function PATCH(req: NextRequest) {
  const current = await requireSuperAdmin();
  if (!current) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation", issues: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;

  try {
    switch (data.action) {
      case "mute": {
        if (data.id === current.id) return NextResponse.json({ error: "cannot_mute_self" }, { status: 400 });
        const mutedUntil = data.mutedUntil ? new Date(data.mutedUntil) : null;
        await prisma.user.update({
          where: { id: data.id },
          data: {
            status: "muted",
            mutedUntil,
            banReason: data.reason || null,
          },
        });
        await logAudit({
          userId: current.id, userName: current.name,
          action: "user.mute", target: `user:${data.id}`,
          details: { mutedUntil: mutedUntil?.toISOString() || "permanent", reason: data.reason },
        });
        return NextResponse.json({ ok: true, action: "muted" });
      }

      case "unmute": {
        await prisma.user.update({
          where: { id: data.id },
          data: { status: "active", mutedUntil: null, banReason: null },
        });
        await logAudit({
          userId: current.id, userName: current.name,
          action: "user.unmute", target: `user:${data.id}`,
        });
        return NextResponse.json({ ok: true, action: "unmuted" });
      }

      case "ban": {
        if (data.id === current.id) return NextResponse.json({ error: "cannot_ban_self" }, { status: 400 });
        await prisma.user.update({
          where: { id: data.id },
          data: { status: "banned", bannedAt: new Date(), banReason: data.reason || null },
        });
        await logAudit({
          userId: current.id, userName: current.name,
          action: "user.ban", target: `user:${data.id}`,
          details: { reason: data.reason },
        });
        return NextResponse.json({ ok: true, action: "banned" });
      }

      case "unban": {
        await prisma.user.update({
          where: { id: data.id },
          data: { status: "active", bannedAt: null, banReason: null },
        });
        await logAudit({
          userId: current.id, userName: current.name,
          action: "user.unban", target: `user:${data.id}`,
        });
        return NextResponse.json({ ok: true, action: "unbanned" });
      }

      case "ip_ban": {
        const existing = await prisma.ipBan.findUnique({ where: { ip: data.ip } });
        if (existing) return NextResponse.json({ error: "already_banned" }, { status: 409 });
        await prisma.ipBan.create({
          data: { ip: data.ip, reason: data.reason || null, bannedBy: current.id },
        });
        await logAudit({
          userId: current.id, userName: current.name,
          action: "ip.ban", target: `ip:${data.ip}`,
          details: { reason: data.reason, userId: data.userId },
        });
        return NextResponse.json({ ok: true, action: "ip_banned" });
      }

      case "ip_unban": {
        await prisma.ipBan.deleteMany({ where: { ip: data.ip } });
        await logAudit({
          userId: current.id, userName: current.name,
          action: "ip.unban", target: `ip:${data.ip}`,
        });
        return NextResponse.json({ ok: true, action: "ip_unbanned" });
      }
    }
  } catch (error: any) {
    console.error("[moderation:users]", error);
    return NextResponse.json({ error: error.message || "failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
