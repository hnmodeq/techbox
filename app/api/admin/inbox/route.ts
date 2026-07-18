import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { cacheHeaders, PRIVATE_NO_STORE } from "@/lib/cache-headers";

async function requireSuperAdmin() {
  const user = await getSessionUserPublic();
  return user && user.role === "super_admin" ? user : null;
}

export async function GET(req: NextRequest) {
  const admin = await requireSuperAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cacheHeaders(PRIVATE_NO_STORE) });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "all";

  try {
    const where = type === "all" ? {} : { type };
    const submissions = await prisma.contactSubmission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(submissions, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  } catch {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

/** PATCH: update status (new → read → resolved) */
export async function PATCH(req: NextRequest) {
  const admin = await requireSuperAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cacheHeaders(PRIVATE_NO_STORE) });

  try {
    const body = await req.json();
    const { id, status } = body;
    if (!id || !["new", "read", "resolved"].includes(status)) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400, headers: cacheHeaders(PRIVATE_NO_STORE) });
    }
    await prisma.contactSubmission.update({ where: { id }, data: { status } });
    return NextResponse.json({ ok: true }, { headers: cacheHeaders(PRIVATE_NO_STORE) });
  } catch {
    return NextResponse.json({ error: "update_failed" }, { status: 500, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

export const dynamic = "force-dynamic";
