import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cacheHeaders, PUBLIC_CONTENT_CACHE } from "@/lib/cache-headers";

const PUBLIC_KEYS = ["shop.banners"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  try {
    if (key && PUBLIC_KEYS.includes(key)) {
      const setting = await prisma.siteSetting.findUnique({ where: { key } });
      return NextResponse.json(
        { [key]: setting?.value ?? null },
        { headers: cacheHeaders(PUBLIC_CONTENT_CACHE) }
      );
    }
    const settings = await prisma.siteSetting.findMany({ where: { key: { in: PUBLIC_KEYS } } });
    const map: Record<string, string | null> = {};
    for (const k of PUBLIC_KEYS) map[k] = null;
    for (const s of settings) map[s.key] = s.value;
    return NextResponse.json(map, { headers: cacheHeaders(PUBLIC_CONTENT_CACHE) });
  } catch {
    return NextResponse.json({}, { headers: cacheHeaders(PUBLIC_CONTENT_CACHE) });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
