import { describe, expect, it } from "vitest";
import {
  containsInternalProductFields,
  stripInternalProductFields,
} from "@/lib/public-content";

describe("public content DTO redaction", () => {
  it("removes procurement and margin inputs without mutating the source", () => {
    const source = {
      id: "p1",
      title: "NAS",
      priceAmount: 120_000_000,
      sourcePriceAmount: 500,
      sourceCurrency: "USD",
      priceAdjustmentPercent: 10,
      sellerBenefitPercent: 35,
    };
    const result = stripInternalProductFields(source);
    expect(result).toEqual({ id: "p1", title: "NAS", priceAmount: 120_000_000 });
    expect(containsInternalProductFields(result)).toBe(false);
    expect(containsInternalProductFields(source)).toBe(true);
    expect(source.sourcePriceAmount).toBe(500);
  });

  it("is safe for non-product content", () => {
    expect(stripInternalProductFields({ id: "article", title: "RAID guide" }))
      .toEqual({ id: "article", title: "RAID guide" });
  });
});
