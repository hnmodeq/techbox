import { describe, it, expect } from "vitest";
import {
  faPrice,
  faPriceBare,
  faDiscountedPrice,
  faPercent,
  faCount,
  faRating,
  faCountdown,
  isDiscountLive,
  TOMAN,
} from "@/lib/format-price";

describe("faPrice", () => {
  it("renders long form with Persian digits and U+066C separators", () => {
    expect(faPrice(120771000)).toBe("۱۲۰٬۷۷۱٬۰۰۰ تومان");
  });

  it("never abbreviates to millions (decision D9)", () => {
    const out = faPrice(12400000);
    expect(out).toBe("۱۲٬۴۰۰٬۰۰۰ تومان");
    expect(out).not.toContain("میلیون");
  });

  it("rounds sub-Toman precision away", () => {
    expect(faPrice(1000.4)).toBe("۱٬۰۰۰ تومان");
    expect(faPrice(1000.6)).toBe("۱٬۰۰۱ تومان");
  });

  it("handles zero", () => {
    expect(faPrice(0)).toBe("۰ تومان");
  });

  it("returns empty string for null/undefined/NaN rather than 'NaN تومان'", () => {
    expect(faPrice(null)).toBe("");
    expect(faPrice(undefined)).toBe("");
    expect(faPrice(Number.NaN)).toBe("");
    expect(faPrice(Number.POSITIVE_INFINITY)).toBe("");
  });

  it("handles a very large catalogue price", () => {
    expect(faPrice(3590811000)).toBe("۳٬۵۹۰٬۸۱۱٬۰۰۰ تومان");
  });

  it("faPriceBare omits the currency word", () => {
    expect(faPriceBare(120771000)).toBe("۱۲۰٬۷۷۱٬۰۰۰");
    expect(faPriceBare(120771000)).not.toContain(TOMAN);
  });
});

describe("faDiscountedPrice", () => {
  it("computes the discounted price and keeps the original", () => {
    const r = faDiscountedPrice(100000, 20);
    expect(r).not.toBeNull();
    expect(r!.now).toBe("۸۰٬۰۰۰ تومان");
    expect(r!.was).toBe("۱۰۰٬۰۰۰ تومان");
    expect(r!.badge).toBe("٪۲۰");
    expect(r!.saved).toBe(20000);
  });

  it("returns null when there is no discount, so no strikethrough renders", () => {
    expect(faDiscountedPrice(100000, 0)).toBeNull();
    expect(faDiscountedPrice(100000, null)).toBeNull();
    expect(faDiscountedPrice(100000, undefined)).toBeNull();
    expect(faDiscountedPrice(100000, -5)).toBeNull();
  });

  it("returns null for a missing base price", () => {
    expect(faDiscountedPrice(null, 20)).toBeNull();
  });

  it("clamps a discount above 100%", () => {
    const r = faDiscountedPrice(100000, 150);
    expect(r!.now).toBe("۰ تومان");
  });

  it("works on a real catalogue price", () => {
    const r = faDiscountedPrice(120771000, 18);
    expect(r!.now).toBe("۹۹٬۰۳۲٬۲۲۰ تومان");
  });
});

describe("faPercent", () => {
  it("puts the percent sign first, as Persian is written", () => {
    expect(faPercent(20)).toBe("٪۲۰");
    expect(faPercent(5)).toBe("٪۵");
  });
});

describe("faCount", () => {
  it("joins a Persian numeral to a unit noun", () => {
    expect(faCount(24, "نظر")).toBe("۲۴ نظر");
    expect(faCount(1200, "بازدید")).toBe("۱٬۲۰۰ بازدید");
  });

  it("returns empty for null rather than 'null نظر'", () => {
    expect(faCount(null, "نظر")).toBe("");
  });

  it("keeps zero visible — '۰ نظر' is meaningful", () => {
    expect(faCount(0, "نظر")).toBe("۰ نظر");
  });
});

describe("faRating", () => {
  it("formats out of five with a Persian decimal separator", () => {
    expect(faRating(4.5)).toBe("۴٫۵ از ۵");
  });

  it("returns empty for a null rating so stars stay hidden", () => {
    expect(faRating(null)).toBe("");
    expect(faRating(undefined)).toBe("");
  });

  it("rounds to one decimal place", () => {
    expect(faRating(4.26)).toBe("۴٫۳ از ۵");
  });
});

describe("faCountdown", () => {
  const now = new Date("2026-07-26T12:00:00Z");

  it("renders HH:MM:SS in Persian digits", () => {
    const end = new Date(now.getTime() + 3 * 3600_000 + 45 * 60_000);
    expect(faCountdown(end, now)).toBe("۰۳:۴۵:۰۰");
  });

  it("pads single digits with a Persian zero", () => {
    const end = new Date(now.getTime() + 5 * 60_000 + 7 * 1000);
    expect(faCountdown(end, now)).toBe("۰۰:۰۵:۰۷");
  });

  it("returns null once expired, so no frozen timer renders", () => {
    const past = new Date(now.getTime() - 1000);
    expect(faCountdown(past, now)).toBeNull();
  });

  it("returns null for missing or invalid input", () => {
    expect(faCountdown(null, now)).toBeNull();
    expect(faCountdown(undefined, now)).toBeNull();
    expect(faCountdown("not-a-date", now)).toBeNull();
  });

  it("accepts an ISO string", () => {
    expect(faCountdown("2026-07-26T14:00:00Z", now)).toBe("۰۲:۰۰:۰۰");
  });

  it("counts past 24h into the hours field rather than wrapping", () => {
    const end = new Date(now.getTime() + 30 * 3600_000);
    expect(faCountdown(end, now)).toBe("۳۰:۰۰:۰۰");
  });
});

describe("isDiscountLive", () => {
  const now = new Date("2026-07-26T12:00:00Z");

  it("is true for a running discount", () => {
    expect(isDiscountLive(20, new Date(now.getTime() + 3600_000), now)).toBe(true);
  });

  it("is false for an expired discount", () => {
    expect(isDiscountLive(20, new Date(now.getTime() - 3600_000), now)).toBe(false);
  });

  it("is false when there is no discount at all", () => {
    expect(isDiscountLive(0, new Date(now.getTime() + 3600_000), now)).toBe(false);
    expect(isDiscountLive(null, null, now)).toBe(false);
  });

  it("treats an open-ended discount as live", () => {
    expect(isDiscountLive(15, null, now)).toBe(true);
  });
});
