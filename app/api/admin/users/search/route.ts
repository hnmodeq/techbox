import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/api-permissions";
import { PRIVATE_NO_STORE, cacheHeaders } from "@/lib/cache-headers";

export async function GET(req: NextRequest) {
  const user = await requirePermission("user:list:view");
  if (user instanceof NextResponse) return user;

  const q = new URL(req.url).searchParams.get("q") || "";
  const verified = new URL(req.url).searchParams.get("verified") === "1";

  const where: any = { status: "active" };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { username: { contains: q, mode: "insensitive" } },
      { job: { contains: q, mode: "insensitive" } },
    ];
  }
  if (verified) {
    where.verifiedType = { not: null };
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      username: true,
      job: true,
      roleFa: true,
      avatar: true,
      verifiedType: true,
      verifiedLabel: true,
    },
    orderBy: { name: "asc" },
    take: 50,
  });

  return NextResponse.json(users, { headers: cacheHeaders(PRIVATE_NO_STORE) });
}

export const dynamic = "force-dynamic";
