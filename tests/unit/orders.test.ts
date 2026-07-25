import { describe, expect, it } from "vitest";
import {
  calculateOrderUnitPrice,
  createOrderAccessToken,
  hashOrderAccessToken,
  OrderPricingError,
  priceOrderItems,
  verifyOrderAccessToken,
  type ShopProductForOrder,
} from "@/lib/orders";
import type { CurrencyRates } from "@/lib/currency";

const rates: CurrencyRates = {
  USD: 100_000,
  EUR: 120_000,
  AED: 30_000,
  globalAdjustmentPercent: 0,
};

function product(overrides: Partial<ShopProductForOrder> = {}): ShopProductForOrder {
  return {
    id: "product-1",
    slug: "nas-1",
    module: "shop",
    title: "NAS 1",
    image: null,
    published: true,
    deletedAt: null,
    availability: "موجود",
    priceAmount: 10_000_000,
    sourcePriceAmount: null,
    sourceCurrency: "USD",
    priceAdjustmentPercent: 0,
    sellerBenefitPercent: 35,
    discountPercent: null,
    discountEndsAt: null,
    ...overrides,
  };
}

describe("authoritative order pricing", () => {
  it("prices requested slugs from canonical products and quantities", () => {
    const result = priceOrderItems([{ slug: "nas-1", quantity: 2 }], [product()], rates);
    expect(result.items).toEqual([
      expect.objectContaining({ postId: "product-1", slug: "nas-1", price: 10_000_000, quantity: 2 }),
    ]);
    expect(result.subtotal).toBe(20_000_000);
  });

  it("applies currency, product, seller, and active discount rules on the server", () => {
    const item = product({
      priceAmount: 1,
      sourcePriceAmount: 100,
      priceAdjustmentPercent: 10,
      sellerBenefitPercent: 20,
      discountPercent: 10,
      discountEndsAt: new Date("2030-01-02T00:00:00Z"),
    });
    expect(calculateOrderUnitPrice(item, rates, new Date("2030-01-01T00:00:00Z"))).toBe(11_880_000);
  });

  it("does not apply an expired discount", () => {
    const item = product({
      priceAmount: 10_000,
      discountPercent: 25,
      discountEndsAt: new Date("2029-12-31T00:00:00Z"),
    });
    expect(calculateOrderUnitPrice(item, rates, new Date("2030-01-01T00:00:00Z"))).toBe(10_000);
  });

  it("rejects unknown, unavailable, and unpriced products", () => {
    expect(() => priceOrderItems([{ slug: "missing", quantity: 1 }], [], rates)).toThrowError(OrderPricingError);
    expect(() => priceOrderItems([{ slug: "nas-1", quantity: 1 }], [product({ availability: "ناموجود" })], rates)).toThrowError(/موجود نیست/);
    expect(() => priceOrderItems([{ slug: "nas-1", quantity: 1 }], [product({ priceAmount: 0 })], rates)).toThrowError(/قیمت قابل پرداخت/);
  });

  it("consolidates duplicate quantities and enforces the maximum", () => {
    const result = priceOrderItems(
      [{ slug: "nas-1", quantity: 2 }, { slug: "nas-1", quantity: 3 }],
      [product()],
      rates
    );
    expect(result.items[0].quantity).toBe(5);
    expect(() => priceOrderItems(
      [{ slug: "nas-1", quantity: 15 }, { slug: "nas-1", quantity: 6 }],
      [product()],
      rates
    )).toThrowError(/حداکثر تعداد/);
  });
});

describe("order access capability", () => {
  it("stores only a hash and verifies the raw token in constant-time form", () => {
    const token = createOrderAccessToken();
    const hash = hashOrderAccessToken(token);
    expect(token).not.toBe(hash);
    expect(verifyOrderAccessToken(token, hash)).toBe(true);
    expect(verifyOrderAccessToken(`${token}x`, hash)).toBe(false);
    expect(verifyOrderAccessToken(null, hash)).toBe(false);
  });
});
