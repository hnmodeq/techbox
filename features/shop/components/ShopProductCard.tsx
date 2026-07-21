"use client";

import Image from "next/image";
import Link from "next/link";
import { blurProps } from "@/lib/image-placeholder";
import type { ContentItem } from "@/lib/content";
import { useCountdown } from "@/hooks/useCountdown";
import { useProductComparison } from "@/hooks/useProductComparison";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GitCompareArrows, Star, ShieldCheck, Cpu, MemoryStick, HardDrive, Network } from "lucide-react";
import { cn } from "@/lib/utils";

function formatPrice(amount: number): string {
  if (amount >= 1_000_000_000) {
    const b = amount / 1_000_000_000;
    const label = b % 1 === 0
      ? b.toLocaleString("fa-IR")
      : b.toLocaleString("fa-IR", { maximumFractionDigits: 2 });
    return label + " میلیارد تومان";
  }
  const m = Math.round(amount / 1_000_000);
  return m.toLocaleString("fa-IR") + " میلیون تومان";
}

const SPEC_DEFS: Array<{ Icon: React.ElementType; key: string; label: string }> = [
  { Icon: Cpu,         key: "CPU",          label: "پردازنده" },
  { Icon: MemoryStick, key: "RAM",          label: "حافظه" },
  { Icon: HardDrive,   key: "Bay",          label: "درایو / Bay" },
  { Icon: Network,     key: "Network Card", label: "کارت شبکه" },
];

const NA_VALUES = new Set(["n/a", "na", "-", "", "N/A"]);
function isNA(v: unknown): boolean {
  return !v || NA_VALUES.has(String(v).trim());
}

function DiscountTimer({ endsAt }: { endsAt: string }) {
  const t = useCountdown(endsAt);
  if (!t || t.expired) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="flex items-center gap-px text-[9px] font-mono font-bold text-red-400 mt-0.5 leading-none" dir="ltr">
      {t.days > 0 && <span>{pad(t.days)}d&nbsp;</span>}
      <span>{pad(t.hours)}</span>
      <span className="animate-pulse mx-px">:</span>
      <span>{pad(t.minutes)}</span>
      <span className="animate-pulse mx-px">:</span>
      <span>{pad(t.seconds)}</span>
    </div>
  );
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-px">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={cn(
              "size-3",
              s <= full
                ? "fill-amber-400 text-amber-400"
                : s === full + 1 && half
                  ? "fill-amber-200 text-amber-400"
                  : "fill-gray-200 text-gray-200"
            )}
          />
        ))}
      </div>
      <span className="text-[10px] text-gray-500 leading-none">
        {rating.toLocaleString("fa-IR", { maximumFractionDigits: 1 })}
      </span>
      {count > 0 && (
        <span className="text-[10px] text-gray-300 leading-none">
          ({count.toLocaleString("fa-IR")})
        </span>
      )}
    </div>
  );
}

export default function ShopProductCard({ product: p }: { product: ContentItem }) {
  const { addToComparison, removeFromComparison, isInComparison } = useProductComparison();
  const inCompare = isInComparison(p.slug);

  const isUnavailable = p.availability === "ناموجود" || p.availability === "اتمام موجودی";
  const specs = (p.specs && typeof p.specs === "object" && !Array.isArray(p.specs))
    ? (p.specs as Record<string, string>)
    : {};

  const priceAmount     = p.priceAmount ?? 0;
  const discount        = p.discountPercent ?? 0;
  const discountedPrice = discount > 0 ? Math.round(priceAmount * (1 - discount / 100)) : priceAmount;

  // Only show specs that have a real (non-N/A) value
  const validSpecs = SPEC_DEFS.filter(({ key }) => !isNA(specs[key]));

  return (
    <div className="relative flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">

      {/* Discount badge */}
      {discount > 0 && !isUnavailable && (
        <div className="absolute top-2 right-2 z-10 flex flex-col items-end">
          <span className="rounded-md bg-red-500 px-1.5 py-0.5 text-[11px] font-bold text-white leading-tight">
            {discount.toLocaleString("fa-IR")}٪
          </span>
          {p.discountEndsAt && <DiscountTimer endsAt={p.discountEndsAt} />}
        </div>
      )}

      {/* Compare button */}
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                inCompare ? removeFromComparison(p.slug) : addToComparison(p);
              }}
              className={cn(
                "absolute top-2 left-2 z-10 flex items-center justify-center rounded-md p-1.5 transition-colors",
                inCompare
                  ? "bg-blue-600 text-white"
                  : "bg-white/90 text-gray-400 hover:text-blue-600 border border-gray-200"
              )}
            >
              <GitCompareArrows className="size-3.5" />
            </button>
          }
        />
        <TooltipContent>{inCompare ? "حذف از مقایسه" : "افزودن به مقایسه"}</TooltipContent>
      </Tooltip>

      {/* Image — white bg with generous padding */}
      <Link href={`/shop/${p.slug}`} className="block">
        <div className="relative w-full bg-white" style={{ paddingBottom: "75%" }}>
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <Image
              src={p.image || "/assets/blog-1.jpg"}
              alt={p.title}
              fill
              sizes="(min-width:1280px) 20vw, (min-width:768px) 33vw, 50vw"
              className="object-contain"
              {...blurProps(p.image || "/assets/blog-1.jpg")}
            />
          </div>
        </div>
      </Link>

      {/* Card body */}
      <div className="flex flex-col gap-2 p-3 flex-1">

        {/* Warranty */}
        {p.warranty && (
          <Tooltip>
            <TooltipTrigger
              render={
                <div className="inline-flex w-fit items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] text-green-700 cursor-default">
                  <ShieldCheck className="size-3 shrink-0" />
                  <span>دارای گارانتی</span>
                </div>
              }
            />
            <TooltipContent>{p.warranty}</TooltipContent>
          </Tooltip>
        )}

        {/* Title */}
        <Link href={`/shop/${p.slug}`}>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors min-h-[2.5rem]">
            {p.title}
          </h3>
        </Link>

        {/* Stars */}
        {(p.rating ?? 0) > 0 && (p.ratingCount ?? 0) > 0 ? (
          <StarRating rating={p.rating!} count={p.ratingCount!} />
        ) : (
          <div className="flex gap-px">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="size-3 fill-gray-200 text-gray-200" />
            ))}
          </div>
        )}

        {/* Spec icons — only specs with real values, hidden if N/A */}
        {validSpecs.length > 0 && (
          <div
            className="grid gap-1 py-1.5 border-y border-gray-100"
            style={{ gridTemplateColumns: `repeat(${validSpecs.length}, 1fr)` }}
          >
            {validSpecs.map(({ Icon, key, label }) => {
              const value = specs[key];
              return (
                <Tooltip key={key}>
                  <TooltipTrigger
                    render={
                      <div className="flex flex-col items-center gap-1 cursor-default py-1 px-0.5 rounded hover:bg-gray-50 transition-colors">
                        <Icon className="size-4 text-gray-400 shrink-0" />
                        <span className="text-[8px] text-gray-500 font-medium leading-tight text-center line-clamp-2 w-full">
                          {value}
                        </span>
                      </div>
                    }
                  />
                  <TooltipContent side="bottom">{label}: {value}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}

        {/* Price */}
        <div className="mt-auto pt-2">
          {isUnavailable ? (
            <span className="text-sm font-bold text-red-500">ناموجود</span>
          ) : priceAmount <= 0 ? (
            <span className="text-sm font-semibold text-gray-500">تماس بگیرید</span>
          ) : (
            <div className="flex flex-col" dir="rtl">
              {discount > 0 && (
                <span className="text-[11px] text-gray-400 line-through leading-none">
                  {formatPrice(priceAmount)}
                </span>
              )}
              <span className={cn("text-sm font-bold leading-snug", discount > 0 ? "text-red-600" : "text-gray-900")}>
                {formatPrice(discountedPrice)}
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
