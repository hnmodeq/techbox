/**
 * Spec keys a product *listing* needs, and nothing more.
 *
 * Why this exists
 * ---------------
 * QNAP product rows carry an average of 123 spec entries (the largest,
 * ts-433eu-us-qnap, has 212). Across the 106 published products that is
 * 13,051 spec rows totalling roughly 1 MB. `getDbModulePosts` used a Prisma
 * `include`, which selects every column, so loading `/shop` transferred
 * **1218 kB — of which 978 kB was `specs`**.
 *
 * `ShopGrid` reads exactly 21 of those keys: the ones behind the bay / CPU
 * family / max-memory / 10GbE / redundant-PSU / M.2 filters, plus warranty.
 * The remaining 531 keys are transferred on every listing load and never
 * read by any listing component.
 *
 * What this is NOT
 * ----------------
 * This is a *transfer* filter, not a data migration. Every spec stays in
 * the database untouched. Product detail pages call `getDbPost`, which is
 * unaffected and still renders the complete `SpecsTableCategorized` table.
 * Deleting the other 531 keys would have destroyed 97% of the product spec
 * data for an identical bandwidth saving, so it was rejected.
 *
 * Keeping this list in sync
 * -------------------------
 * If a new filter is added to ShopGrid, its spec key must be added here or
 * the filter will silently find nothing on the listing while working
 * perfectly on a detail page. `tests/unit/listing-specs.test.ts` guards
 * against that by scraping the keys ShopGrid actually indexes.
 */

/** Spec keys read by ShopGrid's filters and card chips. */
export const LISTING_SPEC_KEYS: readonly string[] = [
  // Drive bays
  "Drive Bay",
  "Bay",
  "تعداد جایگاه دیسک",
  // CPU
  "CPU",
  "پردازنده",
  // Memory
  "System Memory",
  "RAM",
  "حافظه رم",
  "Maximum Memory",
  "حداکثر حافظه",
  // Networking
  "10 Gigabit Ethernet Port",
  "2.5 Gigabit Ethernet Port",
  "2.5 Gigabit Ethernet Port (2.5G/1G/100M)",
  "Network Card",
  // Expansion
  "M.2",
  "M.2 Slot",
  // Power
  "Power Supply Unit",
  "منبع تغذیه",
  // Warranty
  "Standard Warranty",
  "Warranty",
  "گارانتی",
];

const LISTING_SPEC_SET = new Set(LISTING_SPEC_KEYS);

/**
 * Reduce a product's spec object to the keys a listing renders.
 *
 * Returns a plain object so `JSON.stringify` in the RSC payload stays
 * small. Non-object input (null, array, string) yields `{}`, matching the
 * previous behaviour of `getDbModulePosts` exactly.
 */
export function pickListingSpecs(specs: unknown): Record<string, unknown> {
  if (!specs || typeof specs !== "object" || Array.isArray(specs)) return {};
  const source = specs as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of LISTING_SPEC_KEYS) {
    const value = source[key];
    // Skip empty values as well as absent ones: a key present with "" adds
    // bytes and JSON overhead while reading as falsy to every consumer.
    if (value === undefined || value === null || value === "") continue;
    out[key] = value;
  }
  return out;
}

/** True when a key survives listing filtering. Exported for tests. */
export function isListingSpecKey(key: string): boolean {
  return LISTING_SPEC_SET.has(key);
}
