import { NextRequest, NextResponse } from "next/server";
import { getHolidaysForMonth, isHolidaysEnabled } from "@/lib/holidays";
import { cacheHeaders } from "@/lib/cache-headers";

const CACHE_24H = "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") || "0", 10);
  const month = parseInt(searchParams.get("month") || "0", 10);

  if (!year || !month || month < 1 || month > 12) {
    return NextResponse.json({ holidays: [], fridays: [] }, { headers: cacheHeaders(CACHE_24H) });
  }

  try {
    const [holidays, enabled] = await Promise.all([
      getHolidaysForMonth(year, month),
      isHolidaysEnabled(),
    ]);

    if (!enabled) {
      return NextResponse.json({ holidays: [], fridays: [], enabled: false }, { headers: cacheHeaders(CACHE_24H) });
    }

    // All Fridays are off days
    const fridays: number[] = [];

    return NextResponse.json({ holidays, fridays, enabled: true }, { headers: cacheHeaders(CACHE_24H) });
  } catch {
    return NextResponse.json({ holidays: [], fridays: [], enabled: false }, { headers: cacheHeaders(CACHE_24H) });
  }
}
