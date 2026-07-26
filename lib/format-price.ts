/**
 * Price and count formatting for the homepage (and anywhere else that shows
 * a Toman price to a user).
 *
 * Digit conversion is NOT reimplemented here — `toFa` in lib/date-format.ts
 * already wraps Intl.NumberFormat("fa-IR"), which emits Persian digits and
 * the U+066C Arabic thousands separator. This module only adds the
 * presentation rules that were missing.
 *
 * Decision D9 (locked): prices are ALWAYS long form — "۱۲٬۴۰۰٬۰۰۰ تومان".
 * The "۱۲.۴ میلیون" shorthand was explicitly rejected by the owner. Do not
 * reintroduce it without asking.
 *
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §1.6
 */
import { toFa } from "./date-format";

/** Currency suffix used across the site. */
export const TOMAN = "تومان";

/**
 * Long-form Toman price.
 *
 *   faPrice(120771000) → "۱۲۰٬۷۷۱٬۰۰۰ تومان"
 *
 * Rounds to whole Toman: sub-Toman precision is meaningless in this market
 * and a trailing "٫۵" on a nine-digit number just adds noise.
 */
export function faPrice(toman: number | null | undefined): string {
  if (toman == null || !Number.isFinite(toman)) return "";
  return `${toFa(Math.round(toman))} ${TOMAN}`;
}

/** Bare price with no currency word, for tight layouts that label it once. */
export function faPriceBare(toman: number | null | undefined): string {
  if (toman == null || !Number.isFinite(toman)) return "";
  return toFa(Math.round(toman));
}

/**
 * Price after a percentage discount.
 *
 *   faDiscountedPrice(100000, 20) → { now: "۸۰٬۰۰۰ تومان", was: "۱۰۰٬۰۰۰ تومان", saved: 20000 }
 *
 * Returns `null` when there is no real discount, so callers can skip the
 * strikethrough entirely rather than rendering "0% off".
 */
export function faDiscountedPrice(
  base: number | null | undefined,
  discountPercent: number | null | undefined,
): { now: string; was: string; badge: string; saved: number } | null {
  if (base == null || !Number.isFinite(base)) return null;
  if (discountPercent == null || discountPercent <= 0) return null;

  const pct = Math.min(100, Math.max(0, discountPercent));
  const now = Math.round(base * (1 - pct / 100));

  return {
    now: faPrice(now),
    was: faPrice(base),
    badge: faPercent(pct),
    saved: Math.round(base - now),
  };
}

/**
 * Percentage with the Persian percent sign leading, as Persian is written.
 *
 *   faPercent(20) → "٪۲۰"
 */
export function faPercent(n: number): string {
  return `٪${toFa(Math.round(n))}`;
}

/**
 * Counter with a unit noun.
 *
 *   faCount(24, "نظر")  → "۲۴ نظر"
 *   faCount(1200, "بازدید") → "۱٬۲۰۰ بازدید"
 */
export function faCount(n: number | null | undefined, unit: string): string {
  if (n == null || !Number.isFinite(n)) return "";
  return `${toFa(n)} ${unit}`;
}

/**
 * Star rating out of five.
 *
 *   faRating(4.5) → "۴٫۵ از ۵"
 *
 * Returns "" for a null rating so the caller hides the stars rather than
 * defaulting to a flattering 5.
 */
export function faRating(rating: number | null | undefined, outOf = 5): string {
  if (rating == null || !Number.isFinite(rating)) return "";
  const r = Math.round(rating * 10) / 10;
  return `${toFa(r)} از ${toFa(outOf)}`;
}

/**
 * Countdown for a live discount, as HH:MM:SS in Persian digits.
 *
 *   faCountdown(new Date(Date.now() + 3.75 * 3600_000)) → "۰۳:۴۵:۰۰"
 *
 * Returns `null` once the deadline has passed, so an expired deal renders
 * no timer at all instead of a frozen "۰۰:۰۰:۰۰".
 */
export function faCountdown(endsAt: Date | string | null | undefined, now = new Date()): string | null {
  if (!endsAt) return null;
  const end = typeof endsAt === "string" ? new Date(endsAt) : endsAt;
  if (Number.isNaN(end.getTime())) return null;

  const ms = end.getTime() - now.getTime();
  if (ms <= 0) return null;

  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  const pad = (v: number) => toFa(v).padStart(2, "۰");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/** True when a discount is real AND still running — the gate for red UI. */
export function isDiscountLive(
  discountPercent: number | null | undefined,
  discountEndsAt: Date | string | null | undefined,
  now = new Date(),
): boolean {
  if (!discountPercent || discountPercent <= 0) return false;
  if (!discountEndsAt) return true; // open-ended discount is still a discount
  const end = typeof discountEndsAt === "string" ? new Date(discountEndsAt) : discountEndsAt;
  return !Number.isNaN(end.getTime()) && end.getTime() > now.getTime();
}
