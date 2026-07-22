import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

// ─── Types ────────────────────────────────────────────────────────────────

export type CurrencyCode = "USD" | "EUR" | "AED";

export type CurrencyRates = {
  USD: number; // Toman per 1 USD
  EUR: number; // Toman per 1 EUR
  AED: number; // Toman per 1 AED (Dirham)
  globalAdjustmentPercent: number; // e.g. 10 means +10% on all products
};

export const DEFAULT_RATES: CurrencyRates = {
  USD: 189000, // as per user: 1 USD = 189,000 Toman
  EUR: 200000,
  AED: 51500,
  globalAdjustmentPercent: 0,
};

// ─── Keys in SiteSetting table ─────────────────────────────────────────────

const KEY_USD = "currency.usd_rate";
const KEY_EUR = "currency.eur_rate";
const KEY_AED = "currency.aed_rate";
const KEY_GLOBAL_ADJ = "currency.global_adjustment_percent";

const ALL_KEYS = [KEY_USD, KEY_EUR, KEY_AED, KEY_GLOBAL_ADJ];

// ─── Helpers ───────────────────────────────────────────────────────────────

function parseNumberSafe(value: string | null | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = parseFloat(value.replace(/,/g, ""));
  return isNaN(n) ? fallback : n;
}

// ─── Read rates (cached) – SINGLE DB QUERY to avoid connection pool exhaustion ──

async function getRatesUncached(): Promise<CurrencyRates> {
  try {
    // Single query for all 4 keys – was previously 4 parallel findUnique which exhausted pool (P2024)
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: ALL_KEYS } },
      select: { key: true, value: true },
    });
    const map = new Map(rows.map((r) => [r.key, r.value]));

    return {
      USD: parseNumberSafe(map.get(KEY_USD), DEFAULT_RATES.USD),
      EUR: parseNumberSafe(map.get(KEY_EUR), DEFAULT_RATES.EUR),
      AED: parseNumberSafe(map.get(KEY_AED), DEFAULT_RATES.AED),
      globalAdjustmentPercent: parseNumberSafe(map.get(KEY_GLOBAL_ADJ), DEFAULT_RATES.globalAdjustmentPercent),
    };
  } catch {
    return DEFAULT_RATES;
  }
}

export const getCurrencyRates = unstable_cache(getRatesUncached, ["currency-rates-v1"], {
  revalidate: 60,
  tags: ["currency-rates"],
});

// ─── Calculation ───────────────────────────────────────────────────────────

export function calculateFinalTomanPrice(params: {
  sourcePrice: number | null | undefined;
  sourceCurrency: CurrencyCode | string | null | undefined;
  productAdjustmentPercent?: number | null | undefined;
  sellerBenefitPercent?: number | null | undefined;
  rates: CurrencyRates;
}): number {
  const source = params.sourcePrice ?? 0;
  if (source <= 0) return 0;

  const currency = (params.sourceCurrency || "USD").toUpperCase() as CurrencyCode;
  const rate =
    currency === "EUR" ? params.rates.EUR : currency === "AED" ? params.rates.AED : params.rates.USD;

  const baseToman = source * rate;

  const productAdj = params.productAdjustmentPercent ?? 0;
  const globalAdj = params.rates.globalAdjustmentPercent ?? 0;
  const sellerBenefit = params.sellerBenefitPercent ?? 35;

  const afterGlobal = baseToman * (1 + globalAdj / 100);
  const afterProduct = afterGlobal * (1 + productAdj / 100);
  const afterSeller = afterProduct * (1 + sellerBenefit / 100);

  return Math.round(afterSeller);
}

export async function calculateFinalPriceForPost(post: {
  sourcePriceAmount?: number | null;
  sourceCurrency?: string | null;
  priceAdjustmentPercent?: number | null;
  priceAmount?: number | null;
}): Promise<number> {
  if (!post.sourcePriceAmount || post.sourcePriceAmount <= 0) {
    return post.priceAmount ? Math.round(post.priceAmount) : 0;
  }
  const rates = await getCurrencyRates();
  return calculateFinalTomanPrice({
    sourcePrice: post.sourcePriceAmount,
    sourceCurrency: post.sourceCurrency as CurrencyCode,
    productAdjustmentPercent: post.priceAdjustmentPercent,
    sellerBenefitPercent: (post as any).sellerBenefitPercent ?? 35,
    rates,
  });
}

export async function saveCurrencyRates(rates: CurrencyRates, updatedBy: string): Promise<void> {
  for (const [key, value] of [
    [KEY_USD, String(rates.USD)],
    [KEY_EUR, String(rates.EUR)],
    [KEY_AED, String(rates.AED)],
    [KEY_GLOBAL_ADJ, String(rates.globalAdjustmentPercent)],
  ] as const) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value, updatedBy },
      create: { id: `${key}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, key, value, updatedBy },
    });
  }
}
