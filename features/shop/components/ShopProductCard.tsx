"use client";

import Image from "next/image";
import Link from "next/link";
import { blurProps } from "@/lib/image-placeholder";
import type { ContentItem } from "@/lib/content";
import { useCountdown } from "@/hooks/useCountdown";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Star, Cpu, MemoryStick, HardDrive, Network } from "lucide-react";
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

// ── Spec defs — Bay / CPU / RAM / Network Card ────────────────────────────────
const SPEC_DEFS: Array<{ Icon: React.ElementType; key: string }> = [
  { Icon: HardDrive,   key: "Bay" },
  { Icon: Cpu,         key: "CPU" },
  { Icon: MemoryStick, key: "RAM" },
  { Icon: Network,     key: "Network Card" },
];

const NA_VALUES = new Set(["n/a", "na", "-", "", "N/A", "N/A (Expansion Unit)", "N/A (Expansion)"]);
function isNA(v: unknown): boolean {
  return !v || NA_VALUES.has(String(v).trim());
}

// ── Countdown timer — dark text, Farsi font, no days, HH:MM:SS only ──────────
function DiscountTimer({ endsAt }: { endsAt: string }) {
  const t = useCountdown(endsAt);
  if (!t || t.expired) return null;
  const pad = (n: number) => n.toLocaleString("fa-IR").padStart(2, "۰");
  return (
    <div
      className="text-[10px] font-bold leading-none mb-1 text-gray-800"
      dir="ltr"
    >
      {pad(t.hours)}:{pad(t.minutes)}:{pad(t.seconds)}
    </div>
  );
}

// ── Star rating ───────────────────────────────────────────────────────────────
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
                <Star key={s} className={cn("size-3",
                  s <= full ? "fill-amber-400 text-amber-400"
                  : s === full + 1 && half ? "fill-amber-200 text-amber-400"
                  : "fill-gray-200 text-gray-200"
                )} />
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
  const validSpecs      = SPEC_DEFS.filter(({ key }) => !isNA(specs[key]));
  const orig            = formatPrice(priceAmount);
  const disc            = formatPrice(discountedPrice);

  return (
    <Link
      href={`/shop/${p.slug}`}
      className="relative flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden items-center"
    >
      {/* Image — fixed height, centered */}
      <div className="relative w-40 bg-white h-32 flex">
          <Image
            src={p.image || "/assets/blog-1.jpg"}
            alt={p.title}
            fill
            className="object-contain"
            {...blurProps(p.image || "/assets/blog-1.jpg")}
          />
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-2 p-2 justify-center flex-1">

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug min-h-[2.5rem] text-center">
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

        {/* Spec icons */}
        {validSpecs.length > 0 && (
          <div
            className="grid gap-1 py-2 border-y border-gray-100"
            style={{ gridTemplateColumns: `repeat(${validSpecs.length}, 1fr)` }}
          >
            {validSpecs.map(({ Icon, key }) => {
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
                  <TooltipContent side="bottom">{key}: {value}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}

        {/* Bottom row: discount badge (left) + price (right) */}
        <div className="mt-auto flex items-end justify-between gap-2">

          {/* LEFT — discount timer (above) + discount badge. Hidden when no discount */}
          <div className="flex flex-col items-start shrink-0">
            {discount > 0 && !isUnavailable ? (
              <>
                {/* Timer above the badge, primary color */}
                {p.discountEndsAt && <DiscountTimer endsAt={p.discountEndsAt} />}
                {/* Discount % badge */}
                <span className="rounded-md bg-red-500 px-1.5 py-0.5 text-[11px] font-bold text-white leading-tight">
                  {discount.toLocaleString("fa-IR")}٪
                </span>
              </>
            ) : (
              /* Invisible spacer keeps price pinned right on cards without discount */
              <span className="invisible text-[11px]">0٪</span>
            )}
          </div>

          {/* RIGHT — price, always right-aligned */}
          <div className="flex flex-col items-end" dir="rtl">
            {isUnavailable ? (
              <span className="text-sm font-bold text-red-500">ناموجود</span>
            ) : priceAmount <= 0 ? (
              <span className="text-sm font-semibold text-gray-500">تماس بگیرید</span>
            ) : (
              <>
                {/* Original price with strikethrough when discounted */}
                {discount > 0 && (
                  <div className="flex items-baseline gap-1 leading-none mb-0.5">
                    <span className="text-[11px] text-gray-400 line-through">{orig.number}</span>
                    <span className="text-[9px] text-gray-400">{orig.unit}</span>
                  </div>
                )}
                {/* Discounted / normal price — same color always */}
                <div className="flex items-baseline gap-1 leading-none">
                  <span className="text-base font-bold text-gray-900">
                    {disc.number}
                  </span>
                  <span className="text-[10px] font-normal text-gray-500">
                    {disc.unit}
                  </span>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </Link>
  );
}
