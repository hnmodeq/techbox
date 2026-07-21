"use client";

import Image from "next/image";
import Link from "next/link";
import { blurProps } from "@/lib/image-placeholder";
import type { ContentItem } from "@/lib/content";
import { useCountdown } from "@/hooks/useCountdown";
import { Star, Cpu, MemoryStick, HardDrive, Network, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Price helpers ─────────────────────────────────────────────────────────────
function formatPrice(amount: number): { number: string; unit: string } {
  if (!amount || amount <= 0) return { number: "۰", unit: "تومان" };
  return {
    number: Math.round(amount).toLocaleString("fa-IR"),
    unit: "تومان",
  };
}

function parsePriceLabel(label: string | null | undefined): number {
  if (!label) return 0;
  const ascii = label.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  const num = parseFloat(ascii.replace(/[^\\d.]/g, ""));
  if (isNaN(num) || num <= 0) return 0;
  if (/میلیارد/.test(label)) return Math.round(num * 1_000_000_000);
  if (/میلیون/.test(label)) return Math.round(num * 1_000_000);
  return Math.round(num);
}

// ── Spec defs — keep important icons as user requested ───────────────────────
const SPEC_DEFS: Array<{ Icon: React.ElementType; key: string; labelFa: string }> = [
  { Icon: HardDrive, key: "Bay", labelFa: "Bay" },
  { Icon: Cpu, key: "CPU", labelFa: "پردازنده" },
  { Icon: MemoryStick, key: "RAM", labelFa: "رم" },
  { Icon: Network, key: "Network Card", labelFa: "شبکه" },
];

const NA_VALUES = new Set(["n/a", "na", "-", "", "N/A", "N/A (Expansion Unit)", "N/A (Expansion)"]);
function isNA(v: unknown): boolean {
  return !v || NA_VALUES.has(String(v).trim());
}

// ── Timer ─────────────────────────────────────────────────────────────────────
function DiscountTimer({ endsAt, small = false }: { endsAt: string; small?: boolean }) {
  const t = useCountdown(endsAt);
  if (!t || t.expired) return null;
  const pad = (n: number) => n.toString().padStart(2, "0").replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
  // format HH:MM:SS (days folded into hours if >0)
  const totalHours = t.days * 24 + t.hours;
  return (
    <span
      className={cn(
        "font-bold text-[#ef394e] tabular-nums tracking-wider",
        small ? "text-[10px] leading-none" : "text-[11px] leading-none"
      )}
      dir="ltr"
    >
      {pad(totalHours)}:{pad(t.minutes)}:{pad(t.seconds)}
    </span>
  );
}

// ── Rating ────────────────────────────────────────────────────────────────────
function RatingLine({ rating, count }: { rating?: number | null; count?: number }) {
  if (!rating || rating <= 0) return <div className="h-[14px]" />;
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] font-medium text-muted-foreground">
        {rating.toLocaleString("fa-IR", { maximumFractionDigits: 1 })}
      </span>
      <Star className="size-3 fill-[#f9bc00] text-[#f9bc00]" />
    </div>
  );
}

// ── Main card — Digikala style, theme-aware, no white bg behind image ────────
export default function ShopProductCard({ product: p }: { product: ContentItem }) {
  const isUnavailable = p.availability === "ناموجود" || p.availability === "اتمام موجودی";
  const specs = (p.specs && typeof p.specs === "object" && !Array.isArray(p.specs)) ? (p.specs as Record<string, string>) : {};

  const priceAmount = p.priceAmount && p.priceAmount > 0 ? p.priceAmount : parsePriceLabel(p.priceLabel);
  const discount = p.discountPercent ?? 0;
  const discountedPrice = discount > 0 ? Math.round(priceAmount * (1 - discount / 100)) : priceAmount;
  const validSpecs = SPEC_DEFS.filter(({ key }) => !isNA(specs[key])).slice(0, 4);

  const orig = formatPrice(priceAmount);
  const disc = formatPrice(discountedPrice);

  // Amazing vs special sale logic like Digikala
  const badgeText = discount >= 25 ? "پیشنهاد شگفت‌انگیز" : discount > 0 ? "فروش ویژه" : null;

  return (
    <Link
      href={`/shop/${p.slug}`}
      className={cn(
        "group relative flex flex-col",
        "bg-card text-card-foreground",
        "hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:z-10",
        "hover:bg-accent/20 dark:hover:bg-accent/30",
        "transition-all duration-200",
        "min-h-[360px] sm:min-h-[385px]"
      )}
      dir="rtl"
    >
      {/* ── Top label row ── */}
      <div className="flex items-center justify-between px-3 pt-3 h-6">
        {/* left dot (color/availability) */}
        <span
          className={cn(
            "size-[6px] rounded-full shrink-0",
            isUnavailable ? "bg-zinc-300 dark:bg-zinc-600" : "bg-zinc-400/60 dark:bg-zinc-500/60"
          )}
          aria-hidden
        />
        {badgeText && (
          <span className="text-[10px] font-bold leading-none text-[#ef394e] tracking-tight">
            {badgeText}
          </span>
        )}
      </div>

      {/* ── Image — transparent, no white bg, follows theme ── */}
      <div className="relative w-full aspect-[4/3] p-4 flex items-center justify-center bg-transparent">
        <Image
          src={p.image || "/assets/blog-1.jpg"}
          alt={p.title}
          fill
          className="object-contain object-center mix-blend-normal dark:mix-blend-normal"
          {...blurProps(p.image || "/assets/blog-1.jpg")}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
      </div>

      {/* ── Middle content ── */}
      <div className="flex flex-1 flex-col gap-1 px-3">
        {/* Title — 2 lines, 12px like Digikala */}
        <h3 className="line-clamp-2 min-h-[40px] text-right text-[12px] font-normal leading-5 text-foreground/85 group-hover:text-foreground">
          {p.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center justify-between mt-1">
          <RatingLine rating={p.rating} count={p.ratingCount} />
          {/* Warranty/availability mini */}
          {!isUnavailable && p.warranty && (
            <span className="hidden sm:inline text-[9px] text-muted-foreground truncate max-w-[90px]">
              {p.warranty}
            </span>
          )}
        </div>

        {/* Shipping line like Digikala */}
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground min-h-[16px]">
          {!isUnavailable ? (
            <>
              <span className="inline-flex items-center gap-1">
                <Truck className="size-3 text-sky-500" />
                <span className="text-[10px]">ارسال سریع</span>
              </span>
              <span className="text-[9px] text-muted-foreground/60 hidden sm:inline">• دیجی‌کالا</span>
            </>
          ) : (
            <span className="text-[10px] text-red-500/80">ناموجود</span>
          )}
        </div>

        {/* Spec icons — kept as requested, compact */}
        {validSpecs.length > 0 && (
          <div className="mt-1 grid grid-cols-4 gap-1 border-y border-border/40 py-1.5">
            {validSpecs.map(({ Icon, key }) => {
              const value = specs[key];
              return (
                <div
                  key={key}
                  className="flex flex-col items-center gap-0.5 text-center"
                  title={`${key}: ${value}`}
                >
                  <Icon className="size-3.5 text-muted-foreground/70" />
                  <span className="line-clamp-1 w-full text-[8px] leading-3 text-muted-foreground">
                    {String(value).slice(0, 18)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Bottom price + discount ── */}
      <div className="mt-auto flex items-end justify-between gap-2 px-3 pb-3 pt-2">
        {/* Right side visually = badge + timer (start side in RTL) */}
        <div className="flex flex-col items-start gap-1 shrink-0">
          {discount > 0 && !isUnavailable && (
            <>
              {/* Timer above badge if amazing */}
              {p.discountEndsAt && (
                <div className="flex items-center gap-1">
                  <DiscountTimer endsAt={p.discountEndsAt} small />
                </div>
              )}
              <span className="inline-flex h-5 min-w-7 items-center justify-center rounded-full bg-[#ef394e] px-1.5 text-[11px] font-bold leading-none text-white">
                {discount.toLocaleString("fa-IR")}٪
              </span>
            </>
          )}
        </div>

        {/* Left side visually = price (end side in RTL) */}
        <div className="flex flex-col items-end text-left" dir="rtl">
          {isUnavailable ? (
            <span className="text-[12px] font-bold text-muted-foreground">ناموجود</span>
          ) : priceAmount <= 0 ? (
            <span className="text-[11px] font-semibold text-muted-foreground">تماس بگیرید</span>
          ) : (
            <>
              {discount > 0 && (
                <div className="flex items-baseline gap-1 opacity-60">
                  <span className="text-[11px] text-muted-foreground line-through">
                    {orig.number}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="text-[13px] font-bold leading-none text-foreground">
                  {disc.number}
                </span>
                <span className="text-[10px] font-normal text-muted-foreground">تومان</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Subtle bottom border extra timer like Digikala amazing bottom line */}
      {discount >= 20 && p.discountEndsAt && (
        <div className="absolute bottom-0 left-0 right-0 flex h-5 items-center justify-end border-t border-border/30 bg-card/80 px-3 backdrop-blur-[2px]">
          <span className="text-[10px] text-[#ef394e] ml-1">اتمام پیشنهاد:</span>
          <DiscountTimer endsAt={p.discountEndsAt} small />
        </div>
      )}
    </Link>
  );
}
