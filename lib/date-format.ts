/**
 * Unified date/time display utilities for TechBox.
 *
 * Every date shown to users goes through one of these two functions:
 *   - formatRelativeDate(date) → "امروز", "دیروز", "۳ روز پیش", "۱ هفته پیش",
 *     "۲۱ تیر", "۲۱ تیر ۱۴۰۵"
 *   - formatRelativeTime(date) → "لحظاتی پیش", "۳ دقیقه پیش", "۱ ساعت پیش",
 *     then falls through to formatRelativeDate at 24h+
 *
 * All dates are interpreted in Asia/Tehran timezone via the server's
 * wall clock (server rendered) or the client's local time.
 */

import { gregorianToJalali, getPersianMonthName } from "./jalali";

const nf = new Intl.NumberFormat("fa-IR");

/** Converts a number to Persian digits (۰۱۲۳۴۵۶۷۸۹) */
export function toFa(n: number): string {
  return nf.format(n);
}

/**
 * Compute a Tehran-aware "today" reference point.
 * Returns the Gregorian date at Asia/Tehran midnight so day boundaries
 * match Iran's timezone, not the server's local timezone.
 */
function getTehranToday(): Date {
  const now = new Date();
  // Use Intl to get the current date in Asia/Tehran
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(now);
  const m: Record<string, string> = {};
  for (const p of parts) m[p.type] = p.value;
  const y = parseInt(m.year!, 10);
  const mo = parseInt(m.month!, 10);
  const d = parseInt(m.day!, 10);
  return new Date(y, mo - 1, d);
}

/**
 * Get the Jalali date for a given Gregorian Date.
 */
function toJalali(date: Date) {
  return gregorianToJalali(date);
}

/**
 * Format a date relative to today.
 *
 * Rules:
 *   Today          → "امروز"
 *   Yesterday      → "دیروز"
 *   2-6 days ago   → "۲ روز پیش", "۳ روز پیش"...  
 *   7 days ago     → "۱ هفته پیش"
 *   8+ days, same Jalali year  → "۲۱ تیر"
 *   8+ days, different year    → "۲۱ تیر ۱۴۰۵"
 *
 * For dates in the future, falls back to absolute date.
 */
export function formatRelativeDate(date: Date | string | undefined | null): string {
  if (!date) return "";
  const value = typeof date === "string" ? new Date(date) : date;
  if (isNaN(value.getTime())) return "";

  const today = getTehranToday();
  const target = new Date(value);
  // Normalize both to midnight for day calculation
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.round((todayMidnight.getTime() - targetMidnight.getTime()) / 86400000);

  if (diffDays < 0) {
    // Future date — show absolute
    const jalali = toJalali(target);
    const monthName = getPersianMonthName(jalali.month);
    return `${toFa(jalali.day)} ${monthName}`;
  }

  if (diffDays === 0) return "امروز";
  if (diffDays === 1) return "دیروز";
  if (diffDays < 7) return `${toFa(diffDays)} روز پیش`;
  if (diffDays === 7) return "۱ هفته پیش";

  // 8+ days — show absolute
  const jalali = toJalali(target);
  const monthName = getPersianMonthName(jalali.month);
  const todayJalali = toJalali(today);

  if (jalali.year === todayJalali.year) {
    return `${toFa(jalali.day)} ${monthName}`;
  }
  return `${toFa(jalali.day)} ${monthName} ${toFa(jalali.year)}`;
}

/**
 * ─── "تاریخ نسبی" / RelativeDate ──────────────────────────────────────
 *
 * THE canonical relative-date ladder for TechBox. When you want "the
 * normal date display", this is it — render `<RelativeDate />` from
 * `@/components/ui/relative-date`, which wraps this function and adds the
 * absolute-date tooltip.
 *
 * Unlike `formatRelativeDate`, this NEVER falls back to an absolute date;
 * the ladder continues all the way up. The absolute date is what the
 * tooltip is for.
 *
 *   < 1 minute   → "لحظاتی پیش"
 *   < 1 hour     → "۵ دقیقه پیش"
 *   < 24 hours   → "۳ ساعت پیش"
 *   < 1 week     → "۲ روز پیش"
 *   < 1 month    → "۴ هفته پیش"
 *   < 1 year     → "۱۲ ماه پیش"
 *   otherwise    → "۱ سال پیش"
 *
 * A month is 30 days and a year is 365 days here. Calendar-exact month
 * arithmetic would make "۱۲ ماه پیش" and "۱ سال پیش" disagree at the
 * boundary, and the whole point of this scale is a single smooth ladder.
 */
export function formatRelativeFa(date: Date | string | undefined | null): string {
  if (!date) return "";
  const value = typeof date === "string" ? new Date(date) : date;
  if (isNaN(value.getTime())) return "";

  const diffSeconds = Math.floor((Date.now() - value.getTime()) / 1000);

  // Future dates (scheduled posts that slipped through) read as brand new
  // rather than as a negative duration.
  if (diffSeconds < 60) return "لحظاتی پیش";

  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `${toFa(minutes)} دقیقه پیش`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${toFa(hours)} ساعت پیش`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${toFa(days)} روز پیش`;

  if (days < 30) return `${toFa(Math.floor(days / 7))} هفته پیش`;

  if (days < 365) return `${toFa(Math.floor(days / 30))} ماه پیش`;

  return `${toFa(Math.floor(days / 365))} سال پیش`;
}

/**
 * The absolute Jalali date behind a relative label — "۱ تیر", or
 * "۱ تیر ۱۴۰۴" when it is not the current Jalali year.
 *
 * This is what `<RelativeDate />` shows in its tooltip.
 */
export function formatAbsoluteFa(date: Date | string | undefined | null): string {
  if (!date) return "";
  const value = typeof date === "string" ? new Date(date) : date;
  if (isNaN(value.getTime())) return "";

  const jalali = toJalali(value);
  const monthName = getPersianMonthName(jalali.month);
  const currentYear = toJalali(getTehranToday()).year;

  if (jalali.year === currentYear) return `${toFa(jalali.day)} ${monthName}`;
  return `${toFa(jalali.day)} ${monthName} ${toFa(jalali.year)}`;
}

/**
 * Format a date relative to now with minute/second precision for very recent items.
 * Falls through to formatRelativeDate for items older than 24 hours.
 *
 * Rules:
 *   < 1 min       → "لحظاتی پیش"
 *   1-59 min      → "۳ دقیقه پیش"
 *   1-23 hrs      → "۲ ساعت پیش"
 *   24+ hrs       → delegates to formatRelativeDate
 */
export function formatRelativeTime(date: Date | string | undefined | null): string {
  if (!date) return "";
  const value = typeof date === "string" ? new Date(date) : date;
  if (isNaN(value.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - value.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 0) return formatRelativeDate(value);
  if (diffSeconds < 60) return "لحظاتی پیش";

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${toFa(diffMinutes)} دقیقه پیش`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${toFa(diffHours)} ساعت پیش`;

  // 24+ hours → use the day-based formatter
  return formatRelativeDate(value);
}
