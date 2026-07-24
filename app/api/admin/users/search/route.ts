import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserPublic } from "@/lib/auth-server";
import { PRIVATE_NO_STORE, cacheHeaders } from "@/lib/cache-headers";

export async function GET(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

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
