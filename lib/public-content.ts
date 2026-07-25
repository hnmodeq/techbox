const INTERNAL_PRODUCT_FIELDS = [
  "sourcePriceAmount",
  "sourceCurrency",
  "priceAdjustmentPercent",
  "sellerBenefitPercent",
] as const;

/** Creates an API-safe copy without procurement and margin inputs. */
export function stripInternalProductFields<T extends Record<string, any>>(record: T) {
  const safe: Record<string, any> = { ...record };
  for (const field of INTERNAL_PRODUCT_FIELDS) delete safe[field];
  return safe as Omit<T, typeof INTERNAL_PRODUCT_FIELDS[number]>;
}

export function containsInternalProductFields(record: Record<string, unknown>) {
  return INTERNAL_PRODUCT_FIELDS.some((field) => Object.prototype.hasOwnProperty.call(record, field));
}
