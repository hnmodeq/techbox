"use client";

import Image from "next/image";
import Link from "next/link";
import { blurProps } from "@/lib/image-placeholder";
import type { ContentItem } from "@/lib/content";
import { useCountdown } from "@/hooks/useCountdown";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Star, ShieldCheck, Cpu, MemoryStick, HardDrive, Network } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Price helpers ─────────────────────────────────────────────────────────────
function formatPrice(amount: number): { number: string; unit: string } {
  return {
    number: Math.round(amount).toLocaleString("fa-IR"),
    unit: "تومان",
  };
}

function parsePriceLabel(label: string | null | undefined): number {
  if (!label) return 0;
  const ascii = label.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  const num = parseFloat(ascii.replace(/[^\d.]/g, ""));
  if (isNaN(num) || num <= 0) return 0;
  if (/میلیارد/.test(label)) return Math.round(num * 1_000_000_000);
  if (/میلیون/.test(label))  return Math.round(num * 1_000_000);
  return Math.round(num);
}

// ── Spec defs — always in order: Bay, CPU, RAM, Network Card ─────────────────
const SPEC_DEFS: Array<{ Icon: React.ElementType; key: string; label: string }> = [
  { Icon: HardDrive,   key: "Bay",          label: "درایو / Bay" },
  { Icon: Cpu,         key: "CPU",          label: "پردازنده" },
  { Icon: MemoryStick, key: "RAM",          label: "حافظه" },
  { Icon: Network,     key: "Network Card", label: "کارت شبکه" },
];

const NA_VALUES = new Set(["n/a", "na", "-", "", "N/A", "N/A (Expansion Unit)", "N/A (Expansion)"]);
function isNA(v: unknown): boolean {
  return !v || NA_VALUES.has(String(v).trim());
}

// ── Countdown timer ───────────────────────────────────────────────────────────
function DiscountTimer({ endsAt }: { endsAt: string }) {
  const t = useCountdown(endsAt);
  if (!t || t.expired) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="flex items-center gap-px text-[9px] font-mono font-bold text-red-400 mt-0.5 leading-none" dir="ltr">
      {t.days > 0 && <span>{pad(t.days)}d&nbsp;</span>}
      <span>{pad(t.hours)}</span><span className="animate-pulse mx-px">:</span>
      <span>{pad(t.minutes)}</span><span className="animate-pulse mx-px">:</span>
      <span>{pad(t.seconds)}</span>
    </div>
  );
}

// ── Stars with "رضایت خریدار" tooltip ────────────────────────────────────────
function StarRating({ rating, count }: { rating: number; count: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div className="flex items-center gap-1 cursor-default w-fit">
            <div className="flex gap-px">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={cn("size-3",
                    s <= full ? "fill-amber-400 text-amber-400"
                    : s === full + 1 && half ? "fill-amber-200 text-amber-400"
                    : "fill-gray-200 text-gray-200"
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-500 leading-none">
              {rating.toLocaleString("fa-IR", { maximumFractionDigits: 1 })}
            </span>
            {count > 0 && (
              <span className="text-[10px] text-gray-300 leading-none">({count.toLocaleString("fa-IR")})</span>
            )}
          </div>
        }
      />
      <TooltipContent>رضایت خریدار</TooltipContent>
    </Tooltip>
  );
}

// ── Main card ─────────────────────────────────────────────────────────────────
export default function ShopProductCard({ product: p }: { product: ContentItem }) {
  const isUnavailable = p.availability === "ناموجود" || p.availability === "اتمام موجودی";
  const specs = (p.specs && typeof p.specs === "object" && !Array.isArray(p.specs))
    ? (p.specs as Record<string, string>) : {};

  const priceAmount     = (p.priceAmount && p.priceAmount > 0) ? p.priceAmount : parsePriceLabel(p.priceLabel);
  const discount        = p.discountPercent ?? 0;
  const discountedPrice = discount > 0 ? Math.round(priceAmount * (1 - discount / 100)) : priceAmount;

  // Show all 4 spec slots — always Bay/CPU/RAM/Network Card
  // Each slot hidden if N/A
  const validSpecs = SPEC_DEFS.filter(({ key }) => !isNA(specs[key]));

  const orig = formatPrice(priceAmount);
  const disc = formatPrice(discountedPrice);

  return (
    <Link
      href={`/shop/${p.slug}`}
      className="relative flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
    >
      {/* Discount badge + countdown — top-right */}
      {discount > 0 && !isUnavailable && (
        <div className="absolute top-2 right-2 z-10 flex flex-col items-end">
          <span className="rounded-md bg-red-500 px-1.5 py-0.5 text-[11px] font-bold text-white leading-tight">
            {discount.toLocaleString("fa-IR")}٪
          </span>
          {p.discountEndsAt && <DiscountTimer endsAt={p.discountEndsAt} />}
        </div>
      )}

      {/* Image — white bg, keep size small via px padding */}
      <div className="relative w-full bg-white" style={{ paddingBottom: "70%" }}>
        <div className="absolute inset-0 flex items-center justify-center px-10 py-6">
          <Image
            src={p.image || "/assets/blog-1.jpg"}
            alt={p.title}
            fill
            sizes="(min-width:1280px) 18vw, (min-width:768px) 30vw, 50vw"
            className="object-contain"
            {...blurProps(p.image || "/assets/blog-1.jpg")}
          />
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-2 px-4 pt-2 pb-4 flex-1">

        {/* Title — no hover color, RTL-aligned */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug min-h-[2.5rem] text-right" dir="rtl">
          {p.title}
        </h3>

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

        {/* Spec icons — Bay / CPU / RAM / Network Card, only when not N/A */}
        {validSpecs.length > 0 && (
          <div
            className="grid gap-1 py-2 border-y border-gray-100"
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

        {/* Price row — warranty icon on right, price on left (RTL: price right, icon left) */}
        <div className="mt-auto flex items-end justify-between gap-2" dir="rtl">

          {/* Price — right-justified in RTL */}
          <div className="flex flex-col items-start">
            {isUnavailable ? (
              <span className="text-sm font-bold text-red-500">ناموجود</span>
            ) : priceAmount <= 0 ? (
              <span className="text-sm font-semibold text-gray-500">تماس بگیرید</span>
            ) : (
              <>
                {discount > 0 && (
                  <div className="flex items-baseline gap-1 leading-none mb-0.5">
                    <span className="text-[11px] text-gray-400 line-through">{orig.number}</span>
                    <span className="text-[9px] text-gray-400">{orig.unit}</span>
                  </div>
                )}
                <div className="flex items-baseline gap-1 leading-none">
                  <span className={cn("text-base font-bold", discount > 0 ? "text-red-600" : "text-gray-900")}>
                    {disc.number}
                  </span>
                  <span className={cn("text-[10px] font-normal", discount > 0 ? "text-red-500" : "text-gray-500")}>
                    {disc.unit}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Warranty icon — left side of price row (RTL = after price visually) */}
          {p.warranty && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <div className="flex items-center justify-center cursor-default shrink-0 mb-0.5">
                    <ShieldCheck className="size-5 text-green-500" />
                  </div>
                }
              />
              <TooltipContent>دارای گارانتی — {p.warranty}</TooltipContent>
            </Tooltip>
          )}
        </div>

      </div>
    </Link>
  );
}
