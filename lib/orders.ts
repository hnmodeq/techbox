import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import {
  calculateFinalTomanPrice,
  type CurrencyCode,
  type CurrencyRates,
} from "@/lib/currency";

export const MAX_ORDER_ITEM_QUANTITY = 20;
export const ORDER_ACCESS_TOKEN_BYTES = 32;

export type RequestedOrderItem = {
  slug: string;
  quantity: number;
};

export type ShopProductForOrder = {
  id: string;
  slug: string;
  module: string;
  title: string;
  image: string | null;
  published: boolean;
  deletedAt: Date | null;
  availability: string | null;
  priceAmount: number | null;
  sourcePriceAmount: number | null;
  sourceCurrency: string | null;
  priceAdjustmentPercent: number | null;
  sellerBenefitPercent: number | null;
  discountPercent: number | null;
  discountEndsAt: Date | null;
};

export type PricedOrderItem = {
  postId: string;
  slug: string;
  module: "shop";
  title: string;
  image: string | null;
  price: number;
  quantity: number;
};

export class OrderPricingError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "OrderPricingError";
  }
}

export function createOrderAccessToken(): string {
  return randomBytes(ORDER_ACCESS_TOKEN_BYTES).toString("base64url");
}

export function hashOrderAccessToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function verifyOrderAccessToken(token: string | null | undefined, expectedHash: string | null): boolean {
  if (!token || !expectedHash) return false;
  const actual = Buffer.from(hashOrderAccessToken(token), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function normalizeRequestedOrderItems(items: RequestedOrderItem[]): RequestedOrderItem[] {
  const quantities = new Map<string, number>();
  for (const item of items) {
    const slug = item.slug.trim();
    if (!slug) throw new OrderPricingError("invalid_product", "شناسه محصول نامعتبر است.");
    const next = (quantities.get(slug) ?? 0) + item.quantity;
    if (next > MAX_ORDER_ITEM_QUANTITY) {
      throw new OrderPricingError("quantity_too_large", `حداکثر تعداد مجاز برای ${slug} برابر ${MAX_ORDER_ITEM_QUANTITY} است.`);
    }
    quantities.set(slug, next);
  }
  return Array.from(quantities, ([slug, quantity]) => ({ slug, quantity }));
}

export function calculateOrderUnitPrice(
  product: ShopProductForOrder,
  rates: CurrencyRates,
  now = new Date()
): number {
  let basePrice = product.priceAmount ?? 0;
  if ((product.sourcePriceAmount ?? 0) > 0) {
    basePrice = calculateFinalTomanPrice({
      sourcePrice: product.sourcePriceAmount,
      sourceCurrency: (product.sourceCurrency as CurrencyCode) || "USD",
      productAdjustmentPercent: product.priceAdjustmentPercent,
      sellerBenefitPercent: product.sellerBenefitPercent,
      rates,
    });
  }

  const discount = product.discountPercent ?? 0;
  const discountIsActive = discount > 0 && (!product.discountEndsAt || product.discountEndsAt.getTime() > now.getTime());
  return Math.round(discountIsActive ? basePrice * (1 - discount / 100) : basePrice);
}

export function priceOrderItems(
  requestedItems: RequestedOrderItem[],
  products: ShopProductForOrder[],
  rates: CurrencyRates,
  now = new Date()
): { items: PricedOrderItem[]; subtotal: number } {
  const normalized = normalizeRequestedOrderItems(requestedItems);
  const productMap = new Map(products.map((product) => [product.slug, product]));
  const priced: PricedOrderItem[] = [];

  for (const requested of normalized) {
    const product = productMap.get(requested.slug);
    if (!product || product.module !== "shop" || !product.published || product.deletedAt) {
      throw new OrderPricingError("product_not_found", `محصول «${requested.slug}» در فروشگاه فعال نیست.`);
    }
    if (product.availability === "ناموجود" || product.availability === "اتمام موجودی") {
      throw new OrderPricingError("product_unavailable", `محصول «${product.title}» موجود نیست.`);
    }

    const unitPrice = calculateOrderUnitPrice(product, rates, now);
    if (!Number.isSafeInteger(unitPrice) || unitPrice <= 0) {
      throw new OrderPricingError("product_not_for_sale", `برای محصول «${product.title}» قیمت قابل پرداخت ثبت نشده است.`);
    }

    priced.push({
      postId: product.id,
      slug: product.slug,
      module: "shop",
      title: product.title,
      image: product.image,
      price: unitPrice,
      quantity: requested.quantity,
    });
  }

  const subtotal = priced.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (!Number.isSafeInteger(subtotal) || subtotal <= 0) {
    throw new OrderPricingError("invalid_total", "مبلغ نهایی سفارش معتبر نیست.");
  }
  return { items: priced, subtotal };
}
