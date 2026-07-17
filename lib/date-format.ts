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
export function formatRelativeDate(date: Date | string): string {
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
 * Format a date relative to now with minute/second precision for very recent items.
 * Falls through to formatRelativeDate for items older than 24 hours.
 *
 * Rules:
 *   < 1 min       → "لحظاتی پیش"
 *   1-59 min      → "۳ دقیقه پیش"
 *   1-23 hrs      → "۲ ساعت پیش"
 *   24+ hrs       → delegates to formatRelativeDate
 */
export function formatRelativeTime(date: Date | string): string {
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
