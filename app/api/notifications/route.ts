import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { buildNotificationsForUser } from "@/lib/notifications";

export async function GET() {
  try {
    const user = await getSessionUserPublic();

    if (!user) {
      return NextResponse.json({ items: [], unreadCount: 0, isLoggedIn: false });
    }

    const events = await buildNotificationsForUser(user.id);
    let lastReadAt = new Date(0);

    const state = await prisma.userNotificationState.findUnique({ where: { userId: user.id } });
    lastReadAt = state?.lastReadAt || new Date(0);

    const items = events.map((event) => ({ ...event, read: new Date(event.createdAt) <= lastReadAt }));
    const unreadCount = items.filter((event) => !event.read).length;
    return NextResponse.json({ items, unreadCount, lastReadAt: lastReadAt.toISOString(), isLoggedIn: true });
  } catch {
    return NextResponse.json({ items: [], unreadCount: 0, isLoggedIn: false });
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(`${user.id}:${ip}`, "views");
  if (!rateLimit.success) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const lastReadAt = body?.lastReadAt ? new Date(body.lastReadAt) : new Date();
    const state = await prisma.userNotificationState.upsert({
      where: { userId: user.id },
      update: { lastReadAt },
      create: { userId: user.id, lastReadAt },
    });
    return NextResponse.json({ ok: true, lastReadAt: state.lastReadAt.toISOString() });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "mark_read_failed" }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
