import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getSessionUserPublic } from "@/lib/auth-server";
import { getHolidays, saveHolidays, isHolidaysEnabled, setHolidaysEnabled } from "@/lib/holidays";
import { z } from "zod";

export async function GET() {
  try {
    const [holidays, enabled] = await Promise.all([getHolidays(), isHolidaysEnabled()]);
    return NextResponse.json({ holidays, enabled });
  } catch {
    return NextResponse.json({ holidays: [], enabled: true });
  }
}

const holidaySchema = z.object({
  id: z.string(),
  jalaliDate: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, "فرمت تاریخ شمسی: 1404/04/31"),
  title: z.string().min(1).max(200),
  isHoliday: z.boolean(),
  recurring: z.boolean(),
});

export async function PATCH(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();

    // Handle enabled toggle
    if (body.enabled !== undefined) {
      await setHolidaysEnabled(Boolean(body.enabled), user.id);
      revalidateTag("holidays", "max");
      return NextResponse.json({ ok: true });
    }

    // Handle holiday list update
    if (Array.isArray(body.holidays)) {
      const holidays = body.holidays.map((h: any) => holidaySchema.parse(h));
      await saveHolidays(holidays, user.id);
      revalidateTag("holidays", "max");
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
