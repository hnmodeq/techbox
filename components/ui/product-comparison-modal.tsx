"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import type { ContentItem } from "@/lib/content";
import { Button } from "@/components/ui/button";

interface ProductComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ContentItem[];
  onRemove: (slug: string) => void;
  onClear: () => void;
}

export default function ProductComparisonModal({
  isOpen,
  onClose,
  products,
  onRemove,
  onClear,
}: ProductComparisonModalProps) {
  if (!isOpen || products.length === 0) return null;

  const allKeys = new Set<string>();
  products.forEach((p) => {
    if (p.specs) {
      Object.keys(p.specs).forEach((k) => allKeys.add(k));
    }
  });
  const specKeys = Array.from(allKeys);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-7xl rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] shadow-[var(--shadow-size)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border-color)] px-6 py-4">
            <div>
              <h2 className="text-xl font-black text-[var(--primary-text)]">مقایسه محصولات</h2>
              <p className="text-sm paragraph-color">{products.length} محصول انتخاب شده</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onClear}>
                <Trash2 className="h-4 w-4 mr-1" /> پاک کردن همه
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto p-6">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="w-48 py-3 pr-4 text-right font-bold text-[var(--primary-text)]">ویژگی</th>
                  {products.map((product, idx) => (
                    <th key={idx} className="min-w-[220px] px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-2">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.title}
                            className="h-16 w-16 rounded object-cover border border-[var(--border-color)]"
                          />
                        )}
                        <div className="font-bold text-[var(--primary-text)] line-clamp-2 text-center">
                          {product.title}
                        </div>
                        <button
                          onClick={() => onRemove(product.slug)}
                          className="text-xs text-[var(--danger)] hover:underline"
                        >
                          حذف از مقایسه
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/50">
                {/* Brand / Model / Price rows */}
                <ComparisonRow label="برند" values={products.map(p => p.brand || "—")} />
                <ComparisonRow label="مدل" values={products.map(p => p.model || "—")} />
                <ComparisonRow label="قیمت" values={products.map(p => p.priceLabel || "—")} highlight />
                <ComparisonRow label="وضعیت" values={products.map(p => p.availability || "—")} />

                {/* Dynamic Specs */}
                {specKeys.map((key, index) => (
                  <ComparisonRow
                    key={index}
                    label={key}
                    values={products.map(p => (p.specs?.[key] as string) || "—")}
                  />
                ))}

                {/* Action row */}
                <tr>
                  <td className="py-4 pr-4 font-bold text-[var(--primary-text)]">اقدام</td>
                  {products.map((product, idx) => (
                    <td key={idx} className="px-4 py-4 text-center">
                      <Button size="sm" className="w-full">
                        درخواست مشاوره
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border-t border-[var(--border-color)] bg-[var(--muted-background)]/30 px-6 py-3 text-xs paragraph-color text-center">
            مقایسه تا ۴ محصول مجاز است
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function ComparisonRow({ label, values, highlight = false }: { label: string; values: (string | number)[]; highlight?: boolean }) {
  return (
    <tr className={highlight ? "bg-[var(--shop)]/5" : ""}>
      <td className="py-3 pr-4 font-bold text-[var(--primary-text)]">{label}</td>
      {values.map((val, idx) => (
        <td key={idx} className="px-4 py-3 text-center paragraph-color font-medium">
          {val}
        </td>
      ))}
    </tr>
  );
}
