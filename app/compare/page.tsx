"use client";

import { useCompare } from "@/providers/compare.provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { X, ArrowRight, Trash2, GitCompareArrows } from "lucide-react";
import { SPEC_FIELDS } from "@/config/nas-specs.config";

export default function ComparePage() {
  const { items, remove, clear } = useCompare();

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center" dir="rtl">
        <div className="rounded-xl border border-border bg-card p-10 space-y-4">
          <GitCompareArrows className="size-16 mx-auto text-muted-foreground/30" />
          <h1 className="text-[20px] font-bold">لیست مقایسه خالی است</h1>
          <p className="text-[13px] text-muted-foreground">
            محصولاتی که می‌خواهید مقایسه کنید را از صفحه محصول اضافه کنید.
          </p>
          <Link href="/landing/storage/shop">
            <Button className="mt-2">مشاهده فروشگاه</Button>
          </Link>
        </div>
      </main>
    );
  }

  // Collect all spec keys that have values across items
  const allSpecKeys = SPEC_FIELDS.map((f) => f.key);

  return (
    <main className="mx-auto max-w-[1600px] px-3 sm:px-4 lg:px-6 py-6" dir="rtl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Link href="/" className="hover:text-foreground">خانه</Link>
        <span>/</span>
        <Link href="/landing/storage/shop" className="hover:text-foreground">فروشگاه</Link>
        <span>/</span>
        <span className="text-foreground">مقایسه محصولات</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[20px] font-black flex items-center gap-2">
          <GitCompareArrows className="size-6 text-primary" />
          مقایسه محصولات ({items.length.toLocaleString("fa-IR")})
        </h1>
        <Button variant="ghost" size="sm" onClick={clear} className="text-destructive gap-1 text-[12px]">
          <Trash2 className="size-3.5" />
          پاک کردن لیست
        </Button>
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[600px]">
          {/* Product header row */}
          <thead>
            <tr className="border-b border-border">
              <th className="w-[160px] p-4 text-right text-[12px] font-bold text-muted-foreground sticky right-0 bg-card z-10">
                محصول
              </th>
              {items.map((item) => (
                <th key={item.slug} className="p-4 min-w-[200px] text-center relative">
                  <button
                    onClick={() => remove(item.slug)}
                    className="absolute top-2 left-2 p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="size-3.5" />
                  </button>
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative w-24 h-24 bg-white rounded-lg overflow-hidden">
                      <Image
                        src={item.image || "/assets/blog-1.jpg"}
                        alt={item.title}
                        fill
                        sizes="96px"
                        className="object-contain"
                      />
                    </div>
                    <Link href={`/shop/${item.slug}`} className="text-[12px] font-bold hover:text-primary line-clamp-2 text-center leading-5">
                      {item.title}
                    </Link>
                    {item.priceAmount ? (
                      <span className="text-[13px] font-black text-primary">
                        {item.priceAmount.toLocaleString("fa-IR")} تومان
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">استعلام</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Specs rows */}
          <tbody>
            {allSpecKeys.map((key, idx) => {
              const field = SPEC_FIELDS.find((f) => f.key === key);
              if (!field) return null;

              // Check if any product has this spec
              const hasValue = items.some((item) => {
                const val = item.specs?.[key];
                return val && String(val).trim() && !["n/a", "na", "-"].includes(String(val).trim().toLowerCase());
              });
              if (!hasValue) return null;

              return (
                <tr key={key} className={idx % 2 === 0 ? "bg-muted/20" : ""}>
                  <td className="p-3 text-[11px] sm:text-[12px] font-medium text-muted-foreground text-right sticky right-0 bg-inherit z-10 border-l border-border/40" dir="rtl">
                    {field.titleFa}
                  </td>
                  {items.map((item) => {
                    const val = item.specs?.[key];
                    const display = val && String(val).trim() && !["n/a", "na", "-"].includes(String(val).trim().toLowerCase())
                      ? String(val)
                      : "—";
                    return (
                      <td key={item.slug} className="p-3 text-[12px] text-foreground text-center" dir="ltr">
                        {display}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Link href="/landing/storage/shop">
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowRight className="size-3.5" />
            بازگشت به فروشگاه
          </Button>
        </Link>
      </div>
    </main>
  );
}
