"use client";

import { SPEC_CATEGORIES, SPEC_FIELDS, CURATED_25_KEYS } from "@/config/nas-specs.config";
import { cn } from "@/lib/utils";

type Props = {
  specs: Record<string, unknown> | null | undefined;
  showAll?: boolean;
};

function normalizeValue(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v).trim();
  if (!s || ["n/a", "na", "-", "N/A"].includes(s.toLowerCase())) return "";
  return s;
}

export default function SpecsTableCategorized({ specs, showAll = false }: Props) {
  if (!specs || typeof specs !== "object") {
    return <p className="text-[13px] text-muted-foreground py-8 text-center">مشخصاتی ثبت نشده است.</p>;
  }

  const entries = Object.entries(specs as Record<string, unknown>)
    .map(([k, v]) => ({ key: k, value: normalizeValue(v) }))
    .filter((e) => e.value);

  if (entries.length === 0) {
    return <p className="text-[13px] text-muted-foreground py-8 text-center">مشخصاتی ثبت نشده است.</p>;
  }

  // Build map of raw key -> field definition
  const fieldMap = new Map<string, (typeof SPEC_FIELDS)[number]>();
  for (const f of SPEC_FIELDS) {
    fieldMap.set(f.key, f);
    // Also allow Persian title as key (if specs already normalized to Persian)
    fieldMap.set(f.titleFa, f);
  }

  // Determine which keys to show: curated 25 if not showAll, else all with mapping or all raw
  const keysToShow = showAll ? entries.map((e) => e.key) : CURATED_25_KEYS.filter((k) => entries.some((e) => e.key === k || e.key.includes(k) || k.includes(e.key)));

  // If curated filtered results in <10, fallback to important fields
  const finalKeys = keysToShow.length >= 10 ? keysToShow : entries.slice(0, 25).map((e) => e.key);

  // Group by category
  const grouped = new Map<string, Array<{ key: string; titleFa: string; value: string }>>();

  for (const rawKey of finalKeys) {
    const entry = entries.find((e) => e.key === rawKey) || entries.find((e) => e.key.includes(rawKey) || rawKey.includes(e.key));
    if (!entry) continue;
    const field = fieldMap.get(entry.key) || fieldMap.get(rawKey);
    const titleFa = field?.titleFa || entry.key;
    const category = field?.category || "other";

    if (!grouped.has(category)) grouped.set(category, []);
    grouped.get(category)!.push({ key: entry.key, titleFa, value: entry.value });
  }

  // Also add any remaining important specs not yet included but present
  if (!showAll) {
    for (const e of entries) {
      const field = fieldMap.get(e.key);
      if (!field) continue;
      if (field.important && !finalKeys.includes(e.key)) {
        if (!grouped.has(field.category)) grouped.set(field.category, []);
        grouped.get(field.category)!.push({ key: e.key, titleFa: field.titleFa, value: e.value });
      }
    }
  }

  // Sort categories by defined order
  const orderedCategories = SPEC_CATEGORIES.map((c) => c.id).concat(["other"]);

  return (
    <div className="space-y-6">
      {orderedCategories.map((catId) => {
        const items = grouped.get(catId);
        if (!items || items.length === 0) return null;
        const catDef = SPEC_CATEGORIES.find((c) => c.id === catId);
        return (
          <div key={catId} className="space-y-3">
            <h3 className="text-[13px] font-black text-foreground border-b pb-2 flex items-center gap-2">
              <span className="size-1 rounded-full bg-primary inline-block" />
              {catDef?.titleFa || (catId === "other" ? "سایر مشخصات" : catId)}
            </h3>
            <div className="divide-y divide-border/60 rounded-lg border bg-card overflow-hidden">
              {items.map((it) => (
                <div key={it.key} className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-2 py-3 px-4 hover:bg-muted/30 transition-colors">
                  <div className="text-[11px] sm:text-[12px] text-muted-foreground font-medium">{it.titleFa}</div>
                  <div className="text-[12px] sm:text-[13px] text-foreground leading-6">{it.value}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

    </div>
  );
}
