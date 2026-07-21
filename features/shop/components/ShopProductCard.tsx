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
  if (amount === 0) return "تماس بگیرید";
  return amount.toLocaleString("fa-IR") + " تومان";
}

const SPEC_ICONS: Array<{ icon: React.ElementType; keys: string[]; label: string }> = [
  { icon: Cpu,         keys: ["cpu", "پردازنده", "CPU"],                         label: "CPU" },
  { icon: MemoryStick, keys: ["ram", "حافظه", "RAM", "Memory"],                  label: "RAM" },
  { icon: HardDrive,   keys: ["bay", "Bay", "دیسک", "ظرفیت", "Storage"],         label: "Storage" },
  { icon: Network,     keys: ["network", "شبکه", "Network Card", "پورت شبکه"],   label: "Network" },
];

function getSpecValue(specs: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = specs[k];
    if (v !== undefined && v !== null && String(v).trim()) return String(v).trim();
  }
  return null;
}

function DiscountTimer({ endsAt }: { endsAt: string }) {
  const t = useCountdown(endsAt);
  if (!t || t.expired) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="flex items-center gap-0.5 text-[9px] font-mono font-bold text-red-500" dir="ltr">
      {t.days > 0 && <span>{pad(t.days)}d:</span>}
      <span>{pad(t.hours)}</span>
      <span className="animate-pulse">:</span>
      <span>{pad(t.minutes)}</span>
      <span className="animate-pulse">:</span>
      <span>{pad(t.seconds)}</span>
    </div>
  );
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={cn("size-3", s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200")}
          />
        ))}
      </div>
      {count > 0 && (
        <span className="text-[10px] text-gray-400">({count.toLocaleString("fa-IR")})</span>
      )}
    </div>
  );
}

export default function ShopProductCard({ product: p }: { product: ContentItem }) {
  const { addToComparison, removeFromComparison, isInComparison } = useProductComparison();
  const inCompare = isInComparison(p.slug);

  const isUnavailable = p.availability === "ناموجود" || p.availability === "اتمام موجودی";

  const specs = (p.specs && typeof p.specs === "object" && !Array.isArray(p.specs))
    ? (p.specs as Record<string, unknown>)
    : {};

  const priceAmount = p.priceAmount ?? 0;
  const discount = p.discountPercent ?? 0;
  const discountedPrice = discount > 0 ? Math.round(priceAmount * (1 - discount / 100)) : priceAmount;

  const specItems = SPEC_ICONS
    .map(({ icon, keys, label }) => ({ icon, label, value: getSpecValue(specs, keys) }))
    .filter((x) => x.value !== null)
    .slice(0, 4);

  return (
    <div className="relative flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">

      {/* Discount badge + countdown */}
      {discount > 0 && !isUnavailable && (
        <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-0.5">
          <span className="flex items-center gap-1 rounded-md bg-red-500 px-1.5 py-0.5 text-[11px] font-bold text-white">
            {discount.toLocaleString("fa-IR")}٪
          </span>
          {p.discountEndsAt && <DiscountTimer endsAt={p.discountEndsAt} />}
        </div>
      )}

      {/* Compare toggle (top-left) */}
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
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/80 text-gray-400 hover:bg-white hover:text-primary border border-gray-200"
              )}
            />
          }
        >
          <GitCompareArrows className="size-3.5" />
        </TooltipTrigger>
        <TooltipContent>{inCompare ? "حذف از مقایسه" : "افزودن به مقایسه"}</TooltipContent>
      </Tooltip>

      {/* Product image — white bg, padding so image appears smaller */}
      <Link href={`/shop/${p.slug}`} className="block">
        <div className="relative aspect-[4/3] bg-white flex items-center justify-center px-10 py-8">
          <div className="relative w-full h-full">
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

        {/* Warranty badge */}
        {p.warranty && (
          <Tooltip>
            <TooltipTrigger
              render={
                <div className="inline-flex w-fit items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] text-green-700 cursor-default" />
              }
            >
              <ShieldCheck className="size-3 shrink-0" />
              <span>دارای گارانتی</span>
            </TooltipTrigger>
            <TooltipContent>{p.warranty}</TooltipContent>
          </Tooltip>
        )}

        {/* Title only */}
        <Link href={`/shop/${p.slug}`}>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {p.title}
          </h3>
        </Link>

        {/* Star rating */}
        {(p.rating ?? 0) > 0 && p.ratingCount ? (
          <StarRating rating={p.rating!} count={p.ratingCount} />
        ) : (
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className="size-3 fill-gray-200 text-gray-200" />
            ))}
          </div>
        )}

        {/* Spec icons (up to 4) */}
        {specItems.length > 0 && (
          <div className="flex items-start gap-4 py-1">
            {specItems.map(({ icon: Icon, label, value }) => (
              <Tooltip key={label}>
                <TooltipTrigger render={<div className="flex flex-col items-center gap-0.5 cursor-default min-w-0" />}>
                  <Icon className="size-3.5 text-gray-400" />
                  <span className="text-[9px] text-gray-500 font-medium leading-tight text-center truncate max-w-[40px]">{value}</span>
                </TooltipTrigger>
                <TooltipContent>{label}: {value}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}

        {/* Price — pushed to bottom */}
        <div className="mt-auto pt-2 border-t border-gray-100">
          {isUnavailable ? (
            <span className="text-sm font-bold text-red-500">ناموجود</span>
          ) : priceAmount === 0 ? (
            <span className="text-sm font-semibold text-gray-600">تماس بگیرید</span>
          ) : (
            <div className="flex flex-col gap-0.5" dir="rtl">
              {discount > 0 && (
                <span className="text-[11px] text-gray-400 line-through">
                  {formatPrice(priceAmount)}
                </span>
              )}
              <span className={cn("text-sm font-bold", discount > 0 ? "text-red-600" : "text-gray-900")}>
                {formatPrice(discountedPrice)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
