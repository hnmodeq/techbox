import { NextRequest, NextResponse } from "next/server";
import { cacheHeaders, PUBLIC_CONTENT_CACHE, PRIVATE_NO_STORE } from "@/lib/cache-headers";
import { advancedSearch } from "@/lib/search";

function normalizeQuery(q: string) {
  return q.trim().replace(/\s+/g, " ").slice(0, 120);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const moduleKey = searchParams.get("module") || undefined;
  const take = Math.min(Math.max(Number(searchParams.get("take") || 40), 1), 100);

  if (!q.trim()) {
    return NextResponse.json({ q, results: [], count: 0 }, { headers: cacheHeaders(PUBLIC_CONTENT_CACHE) });
  }

  try {
    const { results, count } = await advancedSearch({ q, moduleKey, take });
    return NextResponse.json({ q, results, count }, { headers: cacheHeaders(PUBLIC_CONTENT_CACHE) });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "search_failed", q, results: [], count: 0 }, { status: 500, headers: cacheHeaders(PRIVATE_NO_STORE) });
  }
}

export const dynamic = "force-dynamic";
