"use client";

import Image from "next/image";
import Link from "next/link";
import { blurProps } from "@/lib/image-placeholder";
import type { ContentItem } from "@/lib/content";
import { useCountdown } from "@/hooks/useCountdown";
import { Star, Cpu, MemoryStick, HardDrive, Network, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
  const num = parseFloat(ascii.replace(/[^\d.]/g, ""));
  if (isNaN(num) || num <= 0) return 0;
  if (/میلیارد/.test(label)) return Math.round(num * 1_000_000_000);
  if (/میلیون/.test(label)) return Math.round(num * 1_000_000);
  return Math.round(num);
}

// ── Major specs – 4: CPU / RAM / Bay / Network ──
type MajorSpecDef = {
  Icon: React.ElementType;
  possibleKeys: string[];
};

const MAJOR_SPECS: MajorSpecDef[] = [
  {
    Icon: HardDrive,
    possibleKeys: ["Drive Bay", "Bay", "تعداد جایگاه دیسک", "تعداد جایگاه دیسک (Bay)", "جایگاه"],
  },
  {
    Icon: Cpu,
    possibleKeys: ["CPU", "پردازنده", "Processor"],
  },
  {
    Icon: MemoryStick,
    possibleKeys: ["System Memory", "RAM", "حافظه رم", "رم", "Memory", "حافظه"],
  },
  {
    Icon: Network,
    possibleKeys: [
      "10 Gigabit Ethernet Port",
      "2.5 Gigabit Ethernet Port (2.5G/1G/100M)",
      "2.5 Gigabit Ethernet Port",
      "Network Card",
      "PCIe Slot",
      "پورت شبکه",
      "کارت شبکه",
      "شبکه",
    ],
  },
];

const NA_VALUES = new Set(["n/a", "na", "-", "", "N/A", "N/A (Expansion Unit)", "N/A (Expansion)"]);
function isNA(v: unknown): boolean {
  return !v || NA_VALUES.has(String(v).trim());
}

function getSpecValue(specs: Record<string, string>, possibleKeys: string[]): string | null {
  for (const k of possibleKeys) {
    if (specs[k] && !isNA(specs[k])) return String(specs[k]);
    const foundKey = Object.keys(specs).find((sk) => sk.toLowerCase() === k.toLowerCase());
    if (foundKey && !isNA(specs[foundKey])) return String(specs[foundKey]);
    const partial = Object.keys(specs).find((sk) => sk.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(sk.toLowerCase()));
    if (partial && !isNA(specs[partial])) return String(specs[partial]);
  }
  return null;
}

// ── Timer ─────────────────────────────────────────────────────────────────────
function DiscountTimer({ endsAt, small = false }: { endsAt: string; small?: boolean }) {
  const t = useCountdown(endsAt);
  if (!t || t.expired) return null;
  const pad = (n: number) => n.toString().padStart(2, "0").replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
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
function RatingLine({ rating }: { rating?: number | null }) {
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

// ── Main card ─────────────────────────────────────────────────────────────────
export default function ShopProductCard({ product: p }: { product: ContentItem }) {
  const isUnavailable = p.availability === "ناموجود" || p.availability === "اتمام موجودی";
  const specs = (p.specs && typeof p.specs === "object" && !Array.isArray(p.specs)) ? (p.specs as Record<string, string>) : {};

  const priceAmount = p.priceAmount && p.priceAmount > 0 ? p.priceAmount : parsePriceLabel(p.priceLabel);
  const discount = p.discountPercent ?? 0;
  const discountedPrice = discount > 0 ? Math.round(priceAmount * (1 - discount / 100)) : priceAmount;

  const validMajorSpecs = MAJOR_SPECS.map((def) => {
    const value = getSpecValue(specs, def.possibleKeys);
    return value ? { ...def, value } : null;
  })
    .filter(Boolean) as Array<MajorSpecDef & { value: string }>;

  const orig = formatPrice(priceAmount);
  const disc = formatPrice(discountedPrice);

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
        "min-h-[360px] sm:min-h-[395px]"
      )}
      dir="rtl"
    >
      <div className="flex items-center justify-between px-3 pt-3 h-6">
        <span
          className={cn(
            "size-[6px] rounded-full shrink-0",
            isUnavailable ? "bg-zinc-300 dark:bg-zinc-600" : "bg-emerald-500/70"
          )}
          aria-hidden
        />
        {badgeText && <span className="text-[10px] font-bold leading-none text-[#ef394e] tracking-tight">{badgeText}</span>}
      </div>

      <div className="relative w-full aspect-[4/3] p-4 flex items-center justify-center bg-transparent">
        <Image
          src={p.image || "/assets/blog-1.jpg"}
          alt={p.title}
          fill
          className="object-contain object-center"
          {...blurProps(p.image || "/assets/blog-1.jpg")}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 px-3">
        <h3 className="line-clamp-2 min-h-[40px] text-right text-[12px] font-normal leading-5 text-foreground/85 group-hover:text-foreground">
          {p.title}
        </h3>

        <div className="flex items-center justify-between mt-1">
          <RatingLine rating={p.rating} />
          {!isUnavailable && p.warranty && <span className="hidden sm:inline text-[9px] text-muted-foreground truncate max-w-[90px]">{p.warranty}</span>}
        </div>

        <div className="flex items-center gap-1 text-[10px] text-muted-foreground min-h-[16px]">
          {!isUnavailable ? (
            <span className="inline-flex items-center gap-1">
              <Truck className="size-3 text-sky-500" />
              <span className="text-[10px]">موجود در انبار</span>
            </span>
          ) : (
            <span className="text-[10px] text-red-500/80">ناموجود</span>
          )}
        </div>

        {/* 4 major specs with shadcn tooltips — icons only, no labels */}
        {validMajorSpecs.length > 0 && (
          <div className="mt-1 grid grid-cols-4 gap-1 border-y border-border/40 py-2">
            {validMajorSpecs.slice(0, 4).map(({ Icon, value }, idx) => (
              <Tooltip key={idx}>
                <TooltipTrigger
                  render={
                    <div className="flex flex-col items-center gap-0.5 text-center cursor-default">
                      <Icon className="size-3.5 text-muted-foreground/70" />
                      <span className="line-clamp-1 w-full text-[9px] leading-3 text-foreground/80">{String(value).slice(0, 22)}</span>
                    </div>
                  }
                />
                <TooltipContent side="bottom">{String(value).slice(0, 60)}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-1 px-3 pb-3 pt-2">
        <div className="flex items-end justify-between gap-2">
          <div className="shrink-0">
            {discount > 0 && !isUnavailable ? (
              <span className="inline-flex h-5 min-w-7 items-center justify-center rounded-full bg-[#ef394e] px-1.5 text-[11px] font-bold leading-none text-white">
                {discount.toLocaleString("fa-IR")}٪
              </span>
            ) : (
              <span className="h-5 block" />
            )}
          </div>
          <div className="flex flex-col items-end text-left" dir="rtl">
            {isUnavailable ? (
              <span className="text-[12px] font-bold text-muted-foreground">ناموجود</span>
            ) : priceAmount <= 0 ? (
              <span className="text-[11px] font-semibold text-muted-foreground">تماس بگیرید</span>
            ) : (
              <>
                {discount > 0 && (
                  <div className="flex items-baseline gap-1 opacity-60">
                    <span className="text-[11px] text-muted-foreground line-through">{orig.number}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span className="text-[13px] font-bold leading-none text-foreground">{disc.number}</span>
                  <span className="text-[10px] font-normal text-muted-foreground">تومان</span>
                </div>
              </>
            )}
          </div>
        </div>
        {p.discountEndsAt && discount > 0 && !isUnavailable && (
          <div className="flex items-center justify-between gap-1 border-t border-border/30 pt-1.5 mt-0.5">
            <span className="text-[10px] font-medium text-[#ef394e]">اتمام پیشنهاد</span>
            <DiscountTimer endsAt={p.discountEndsAt} small />
          </div>
        )}
      </div>
    </Link>
  );
}
