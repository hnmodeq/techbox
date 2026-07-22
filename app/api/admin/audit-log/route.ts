import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const take = Math.min(Number(req.nextUrl.searchParams.get("take") || "50"), 200);
    const action = req.nextUrl.searchParams.get("action") || undefined;
    const userId = req.nextUrl.searchParams.get("userId") || undefined;

    const where: any = {};
    if (action) where.action = { contains: action };
    if (userId) where.userId = userId;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
    });

    const total = await prisma.auditLog.count({ where });

    return NextResponse.json({ logs, total });
  } catch (error) {
    console.error("[audit-log]", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
