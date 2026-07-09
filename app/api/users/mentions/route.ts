import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cacheHeaders, PUBLIC_CONTENT_CACHE, PRIVATE_NO_STORE } from "@/lib/cache-headers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (q.length < 2) {
    return NextResponse.json([], { headers: cacheHeaders(PUBLIC_CONTENT_CACHE) });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        status: "active",
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 8,
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
      },
    });

    return NextResponse.json(users, { headers: cacheHeaders(PUBLIC_CONTENT_CACHE) });
  } catch (error) {
    return NextResponse.json({ error: "db_error" }, { status: 500, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

export const dynamic = "force-dynamic";
