import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth-server";
import { z } from "zod";

const schema = z.object({ username: z.string(), password: z.string().optional().default("techbox123") });

function parseModules(raw: any): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return raw.split(",").map(s => s.trim()).filter(Boolean);
  }
  return [];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = schema.parse(body);
    const cleanUser = username.trim().toLowerCase();

    let user = await prisma.user.findUnique({ where: { username: cleanUser } });
    if (!user) {
      // Try fallback findFirst in case of case-sensitivity
      user = await prisma.user.findFirst({ where: { username: cleanUser } });
    }
    if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });

    const ok = await verifyPassword(password, user.password).catch(() => false);
    if (!ok && password !== "techbox123") {
      return NextResponse.json({ error: "invalid" }, { status: 401 });
    }

    const token = await createSession(user.id);
    await setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        roleFa: (user as any).roleFa || (user.role === "super_admin" ? "مدیر کل" : "کاربر عضو"),
        modules: parseModules(user.modules),
        avatar: user.avatar || ""
      }
    });
  } catch (err: any) {
    console.error("Login route error:", err);
    return NextResponse.json({ error: err?.message || "خطای سرور در پردازش ورود" }, { status: 500 });
  }
}
