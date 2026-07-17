import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

export type Holiday = {
  id: string;
  /** Jalali date: "1404/04/31" format */
  jalaliDate: string;
  /** Display text */
  title: string;
  /** Is this a national holiday (day off)? */
  isHoliday: boolean;
  /** Recurring every year on this Jalali month/day? */
  recurring: boolean;
};

const KEY_HOLIDAYS = "calendar.holidays";
const KEY_MODULE_ENABLED = "calendar.holidays_enabled";

export async function getHolidays(): Promise<Holiday[]> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: KEY_HOLIDAYS } });
    if (!row?.value) return [];
    return JSON.parse(row.value) as Holiday[];
  } catch {
    return [];
  }
}

export async function saveHolidays(holidays: Holiday[], updatedBy: string): Promise<void> {
  const value = JSON.stringify(holidays);
  await prisma.siteSetting.upsert({
    where: { key: KEY_HOLIDAYS },
    update: { value, updatedBy },
    create: { key: KEY_HOLIDAYS, value, updatedBy },
  });
}

export async function isHolidaysEnabled(): Promise<boolean> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: KEY_MODULE_ENABLED } });
    return row?.value !== "false";
  } catch {
    return true;
  }
}

export async function setHolidaysEnabled(enabled: boolean, updatedBy: string): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key: KEY_MODULE_ENABLED },
    update: { value: String(enabled), updatedBy },
    create: { key: KEY_MODULE_ENABLED, value: String(enabled), updatedBy },
  });
}

/** Get holidays for a specific Jalali month */
export const getHolidaysForMonth = unstable_cache(
  async (jalaliYear: number, jalaliMonth: number): Promise<Holiday[]> => {
    const all = await getHolidays();
    const monthStr = `${jalaliMonth}`;
    return all.filter((h) => {
      const parts = h.jalaliDate.split("/");
      if (parts.length !== 3) return false;
      // Recurring holidays match month/day
      if (h.recurring) return parts[1] === monthStr.padStart(2, "0");
      // Non-recurring must match year/month
      return parts[0] === String(jalaliYear) && parts[1] === monthStr.padStart(2, "0");
    });
  },
  ["holidays-month-v1"],
  { revalidate: 86400, tags: ["holidays"] }
);
