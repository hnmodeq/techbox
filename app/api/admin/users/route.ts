import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic, hashPassword } from "@/lib/auth-server";
import { logAudit } from "@/lib/audit-log";
import { z } from "zod";

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(["super_admin", "editor", "user"]).optional(),
  roleFa: z.string().max(80).nullable().optional(),
  status: z.enum(["active", "suspended", "banned"]).optional(),
  job: z.string().max(120).nullable().optional(),
  birthday: z.string().max(40).nullable().optional(),
  modules: z.array(z.string()).optional(),
  avatar: z.string().max(500).nullable().optional(),
  password: z.string().min(6).max(100).optional(),
  verifiedType: z.enum(["content", "org", "user"]).nullable().optional(),
  verifiedLabel: z.string().max(300).nullable().optional(),
});

async function requireSuperAdmin() {
  const user = await getSessionUserPublic();
  return user && user.role === "super_admin" ? user : null;
}

function safeModules(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((m): m is string => typeof m === "string");
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value || "[]");
      return Array.isArray(parsed) ? parsed.filter((m): m is string => typeof m === "string") : [];
    } catch {
      return [];
    }
  }
  return [];
}

function publicUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    roleFa: user.roleFa,
    status: user.status || "active",
    job: user.job,
    birthday: user.birthday,
    modules: safeModules(user.modules),
    avatar: user.avatar,
    counts: user._count,
    verifiedType: user.verifiedType ?? null,
    verifiedLabel: user.verifiedLabel ?? null,
  };
}

export async function GET(req: NextRequest) {
  const current = await requireSuperAdmin();
  if (!current) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: { select: { posts: true, comments: true, ratings: true } },
        posts: { orderBy: { date: "desc" }, take: 10, select: { id: true, module: true, slug: true, title: true, published: true, views: true, likes: true, date: true } },
        comments: { orderBy: { createdAt: "desc" }, take: 10, include: { post: { select: { module: true, slug: true, title: true } } } },
        ratings: { orderBy: { updatedAt: "desc" }, take: 10, include: { post: { select: { module: true, slug: true, title: true } } } },
      },
    });
    if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const likes = await prisma.like.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" }, take: 10 });
    return NextResponse.json({ user: publicUser(user), activity: { posts: user.posts, comments: user.comments, ratings: user.ratings, likes } });
  }

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { username: "asc" }],
    include: { _count: { select: { posts: true, comments: true, ratings: true } } },
  });
  return NextResponse.json(users.map(publicUser));
}

export async function PATCH(req: NextRequest) {
  const current = await requireSuperAdmin();
  if (!current) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = updateSchema.parse(await req.json());
  if (body.id === current.id && (body.status === "banned" || body.status === "suspended" || (body.role && body.role !== "super_admin"))) {
    return NextResponse.json({ error: "cannot_lock_self" }, { status: 400 });
  }

  const data: any = {};
  for (const key of ["name", "email", "role", "roleFa", "status", "job", "birthday", "avatar", "verifiedType", "verifiedLabel"] as const) {
    if (key in body) data[key] = body[key] ?? null;
  }
  if (body.role) data.roleFa = body.roleFa ?? (body.role === "super_admin" ? "مدیر کل" : body.role === "editor" ? "ویراستار" : "کاربر عضو");
  if (body.modules) data.modules = body.modules;
  if (body.password) data.password = await hashPassword(body.password);

  const updated = await prisma.user.update({
    where: { id: body.id },
    data,
    include: { _count: { select: { posts: true, comments: true, ratings: true } } },
  });

  logAudit({ userId: current.id, userName: current.name, action: "user.update", target: `user:${body.id}`, details: { fields: Object.keys(data), targetName: updated.name } });

  return NextResponse.json(publicUser(updated));
}

export const dynamic = "force-dynamic";
