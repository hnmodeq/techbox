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

// ─── Helpers ───────────────────────────────────────────────────────────────

function parseNumberSafe(value: string | null | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = parseFloat(value.replace(/,/g, ""));
  return isNaN(n) ? fallback : n;
}

async function getSettingRaw(key: string): Promise<string | null> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    return row?.value ?? null;
  } catch {
    return null;
  }
}

// ─── Read rates (cached) ───────────────────────────────────────────────────

async function getRatesUncached(): Promise<CurrencyRates> {
  const [usdRaw, eurRaw, aedRaw, globalAdjRaw] = await Promise.all([
    getSettingRaw(KEY_USD),
    getSettingRaw(KEY_EUR),
    getSettingRaw(KEY_AED),
    getSettingRaw(KEY_GLOBAL_ADJ),
  ]);

  return {
    USD: parseNumberSafe(usdRaw, DEFAULT_RATES.USD),
    EUR: parseNumberSafe(eurRaw, DEFAULT_RATES.EUR),
    AED: parseNumberSafe(aedRaw, DEFAULT_RATES.AED),
    globalAdjustmentPercent: parseNumberSafe(globalAdjRaw, DEFAULT_RATES.globalAdjustmentPercent),
  };
}

export const getCurrencyRates = unstable_cache(getRatesUncached, ["currency-rates-v1"], {
  revalidate: 60, // 1 minute – rates change daily, but we want near-real-time
  tags: ["currency-rates"],
});

// ─── Calculation ───────────────────────────────────────────────────────────

export function calculateFinalTomanPrice(params: {
  sourcePrice: number | null | undefined;
  sourceCurrency: CurrencyCode | string | null | undefined;
  productAdjustmentPercent?: number | null | undefined;
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

  // Final = base * (1 + global%/100) * (1 + product%/100)
  const afterGlobal = baseToman * (1 + globalAdj / 100);
  const afterProduct = afterGlobal * (1 + productAdj / 100);

  return Math.round(afterProduct);
}

// Convenience: calculate from Post row directly
export async function calculateFinalPriceForPost(post: {
  sourcePriceAmount?: number | null;
  sourceCurrency?: string | null;
  priceAdjustmentPercent?: number | null;
  priceAmount?: number | null;
}): Promise<number> {
  // If no source price, fall back to legacy priceAmount (already Toman)
  if (!post.sourcePriceAmount || post.sourcePriceAmount <= 0) {
    return post.priceAmount ? Math.round(post.priceAmount) : 0;
  }
  const rates = await getCurrencyRates();
  return calculateFinalTomanPrice({
    sourcePrice: post.sourcePriceAmount,
    sourceCurrency: post.sourceCurrency as CurrencyCode,
    productAdjustmentPercent: post.priceAdjustmentPercent,
    rates,
  });
}

// ─── Save rates ─────────────────────────────────────────────────────────────

export async function saveCurrencyRates(rates: CurrencyRates, updatedBy: string): Promise<void> {
  const entries: [string, string][] = [
    [KEY_USD, String(rates.USD)],
    [KEY_EUR, String(rates.EUR)],
    [KEY_AED, String(rates.AED)],
    [KEY_GLOBAL_ADJ, String(rates.globalAdjustmentPercent)],
  ];

  for (const [key, value] of entries) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value, updatedBy },
      create: { id: `${key}-${Date.now()}`, key, value, updatedBy },
    });
  }
}
