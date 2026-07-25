import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/api-permissions";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";

export async function GET(req: NextRequest) {
  const admin = await requirePermission("inbox:view");
  if (admin instanceof NextResponse) return admin;
  const type = new URL(req.url).searchParams.get("type") || "all";
  try {
    const submissions = await prisma.contactSubmission.findMany({
      where: type === "all" ? {} : { type },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { replies: { orderBy: { createdAt: "asc" } } },
    });
    return NextResponse.json(submissions, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  } catch {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await requirePermission("inbox:close");
  if (admin instanceof NextResponse) return admin;
  try {
    const { id, status } = await req.json();
    if (!id || !["new", "read", "waiting_user", "closed"].includes(status)) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }
    await prisma.contactSubmission.update({ where: { id }, data: { status } });
    return NextResponse.json({ ok: true }, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  } catch {
    return NextResponse.json({ error: "update_failed" }, { status: 500, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

export const dynamic = "force-dynamic";
