import { NextRequest, NextResponse } from "next/server";
import { getHolidaysForMonth, isHolidaysEnabled } from "@/lib/holidays";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") || "0", 10);
  const month = parseInt(searchParams.get("month") || "0", 10);

  if (!year || !month || month < 1 || month > 12) {
    return NextResponse.json({ holidays: [], fridays: [] });
  }

  try {
    const [holidays, enabled] = await Promise.all([
      getHolidaysForMonth(year, month),
      isHolidaysEnabled(),
    ]);

    if (!enabled) {
      return NextResponse.json({ holidays: [], fridays: [], enabled: false });
    }

    // All Fridays are off days
    const fridays: number[] = [];

    return NextResponse.json({ holidays, fridays, enabled: true });
  } catch {
    return NextResponse.json({ holidays: [], fridays: [], enabled: false });
  }
}

export const revalidate = 3600;
