import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { z } from "zod";

async function requireAdmin() {
  const user = await getSessionUserPublic();
  return user && ["super_admin", "admin"].includes(user.role) ? user : null;
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "pending";

  const requests = await (prisma as any).verificationRequest.findMany({
    where: status === "all" ? {} : { status },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: {
        select: { id: true, name: true, username: true, email: true, avatar: true, verifiedType: true },
      },
    },
  });

  return NextResponse.json({ requests });
}

const reviewSchema = z.object({
  id: z.string().min(1),
  decision: z.enum(["approved", "denied"]),
  adminNote: z.string().max(2000).optional(),
  // For org verified users — admin sets the tooltip label
  verifiedLabel: z.string().max(300).optional(),
});

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const { id, decision, adminNote, verifiedLabel } = parsed.data;

  const request = await (prisma as any).verificationRequest.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true } } },
  });
  if (!request) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (request.status !== "pending") {
    return NextResponse.json({ error: "already_reviewed" }, { status: 409 });
  }

  // Update the request
  await (prisma as any).verificationRequest.update({
    where: { id },
    data: {
      status: decision,
      adminNote: adminNote || null,
      reviewedBy: admin.id,
      reviewedAt: new Date(),
      ...(decision === "approved" && request.type === "org" && verifiedLabel
        ? { /* stored on user below */ }
        : {}),
    },
  });

  // If approved → set verifiedType on user
  if (decision === "approved") {
    await prisma.user.update({
      where: { id: request.userId },
      data: {
        verifiedType: request.type,
        verifiedLabel: request.type === "org" ? (verifiedLabel || null) : null,
      },
    });
  }

  // Create a system notification for the user via a special post-like record
  // We use the notification system by storing a "verification" event.
  // Since our notification system is comment/like based, we'll store the result
  // in the adminNote and surface it via a dedicated notification route.
  // For now we write it to a SiteSetting key as a per-user notification queue.
  // Better: store in a dedicated UserNotification table — but since we don't have
  // that yet, we piggyback on the existing system by writing a special entry.

  // Store notification as a site setting with key "verif_notif_{userId}_{requestId}"
  const notifKey = `verif_notif_${request.userId}_${id}`;
  const notifValue = JSON.stringify({
    decision,
    type: request.type,
    adminNote: adminNote || null,
    reviewedAt: new Date().toISOString(),
  });
  await prisma.siteSetting.upsert({
    where: { key: notifKey },
    update: { value: notifValue, updatedBy: admin.id },
    create: { key: notifKey, value: notifValue, updatedBy: admin.id },
  });

  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
