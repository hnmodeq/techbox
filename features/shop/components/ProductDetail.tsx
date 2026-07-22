"use client";

import type { ContentItem } from "@/lib/content";
import Link from "next/link";
import { ProductGallery } from "@/components/ui/product-gallery";
import { LikeButton } from "@/components/ui/like-button";
import { SaveButton } from "@/components/ui/save-button";
import { ShareButton } from "@/components/ui/share-button";
import CommentSection from "@/features/comment/components/CommentSection";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useConsultation } from "@/providers/consultation.provider";
import { ProductJsonLd } from "@/components/seo/StructuredData";
import { useCountdown } from "@/hooks/useCountdown";
import { Star, Package, GitCompareArrows, Bookmark } from "lucide-react";
import SpecsTableCategorized from "@/features/shop/components/SpecsTableCategorized";

type ProductItem = ContentItem & {
  brand?: string | null;
  model?: string | null;
  sku?: string | null;
  priceLabel?: string | null;
  priceAmount?: number | null;
  discountPercent?: number | null;
  discountEndsAt?: string | null;
  availability?: string | null;
  warranty?: string | null;
  specs?: Record<string, unknown> | null;
};

function formatPrice(amount: number) {
  if (!amount || amount <= 0) return null;
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

function DiscountTimer({ endsAt }: { endsAt: string }) {
  const t = useCountdown(endsAt);
  if (!t || t.expired) return null;
  const pad = (n: number) => n.toString().padStart(2, "0").replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
  const totalHours = t.days * 24 + t.hours;
  return (
    <span className="font-mono text-[12px] font-bold text-[#ef394e]" dir="ltr">
      {pad(totalHours)}:{pad(t.minutes)}:{pad(t.seconds)}
    </span>
  );
}

export default function ProductDetail({ item }: { item: ProductItem }) {
  const gallery = Array.isArray(item.gallery) && item.gallery.length > 0 ? item.gallery : item.image ? [item.image] : [];
  const { add } = useConsultation();

  const isUnavailable = item.availability === "ناموجود" || item.availability === "اتمام موجودی";
  const priceAmount = item.priceAmount && item.priceAmount > 0 ? item.priceAmount : parsePriceLabel(item.priceLabel);
  const discount = item.discountPercent ?? 0;
  const discountedPrice = discount > 0 ? Math.round(priceAmount * (1 - discount / 100)) : priceAmount;

  const orig = formatPrice(priceAmount);
  const disc = formatPrice(discountedPrice);

  const addToCart = () => {
    add({ slug: item.slug, title: item.title, image: item.image || "" });
  };

  return (
    <>
      <ProductJsonLd item={item} />
      <main className="mx-auto max-w-[1680px] px-3 sm:px-4 lg:px-6 py-4" dir="rtl">
        {/* Breadcrumb */}
        <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          <Link href="/" className="hover:text-foreground">خانه</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-foreground">فروشگاه</Link>
          {item.category && (
            <>
              <span>/</span>
              <span className="text-foreground">{item.category}</span>
            </>
          )}
          <span>/</span>
          <span className="line-clamp-1 max-w-[300px] text-foreground/70">{item.title}</span>
        </nav>

        {/* Amazing top bar if discount */}
        {discount >= 15 && item.discountEndsAt && !isUnavailable && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#ef394e]/10 border border-[#ef394e]/20 px-4 py-2">
            <div className="flex items-center gap-2 text-[12px] font-bold text-[#ef394e]">
              <span className="inline-flex h-5 items-center rounded-full bg-[#ef394e] px-2.5 text-[11px] text-white">پیشنهاد شگفت‌انگیز</span>
              <span>٪{discount.toLocaleString("fa-IR")} تخفیف</span>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <span className="text-muted-foreground">اتمام پیشنهاد</span>
              <DiscountTimer endsAt={item.discountEndsAt} />
            </div>
          </div>
        )}

        {/* Main grid — Gallery | Center Info | Left Price */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* Gallery */}
          <div className="lg:col-span-5 xl:col-span-4 order-1">
            <div className="lg:sticky lg:top-24 space-y-3">
              <ProductGallery images={gallery} title={item.title} />

              {/* Actions under gallery: Share | Compare | Save */}
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground border border-border rounded-lg p-2 bg-card">
                <ShareButton />
                <span className="h-3 w-px bg-border" />
                <button type="button" className="flex items-center gap-1 hover:text-foreground transition-colors px-1">
                  <GitCompareArrows className="size-3.5" />
                  <span>مقایسه</span>
                </button>
                <span className="h-3 w-px bg-border" />
                <SaveButton module="shop" slug={item.slug} />
              </div>

              {item.sku && (
                <div className="text-[10px] text-muted-foreground px-1">شناسه کالا: {item.sku}</div>
              )}
            </div>
          </div>

          {/* Center — Details */}
          <div className="lg:col-span-4 xl:col-span-5 order-2 space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-[16px] sm:text-[20px] font-bold leading-7 sm:leading-8 text-foreground">
                {item.title}
              </h1>
              {item.model && (
                <p className="text-[11px] text-muted-foreground" dir="ltr">
                  {item.brand ? `${item.brand} ` : ""}{item.model}
                </p>
              )}
            </div>

            {/* Rating + comments + views */}
            <div className="flex flex-wrap items-center gap-3 text-[12px] border-b border-border pb-4">
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-[#f9bc00] text-[#f9bc00]" />
                <span className="font-bold">{(item.rating ?? 0).toLocaleString("fa-IR", { maximumFractionDigits: 1 })}</span>
                <span className="text-muted-foreground">({(item.ratingCount ?? 0).toLocaleString("fa-IR")})</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-[#19bfd3]">{(item.comments ?? 0).toLocaleString("fa-IR")} دیدگاه</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{item.views.toLocaleString("fa-IR")} بازدید</span>
            </div>

            {/* Availability status */}
            <div className="flex items-center gap-2 text-[12px]">
              <Package className="size-4 text-muted-foreground" />
              <span className={isUnavailable ? "text-red-500" : "text-emerald-600"}>
                {isUnavailable ? "ناموجود" : "موجود در انبار"}
              </span>
            </div>
          </div>

          {/* Left — Price Card */}
          <div className="lg:col-span-3 order-3">
            <div className="lg:sticky lg:top-24 space-y-3">
              <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                {/* Price */}
                <div className="p-4 space-y-3">
                  {!isUnavailable && disc && orig && (
                    <div className="space-y-1 text-left">
                      {discount > 0 && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex h-5 items-center rounded-full bg-[#ef394e] px-2 text-[11px] font-bold text-white">
                            {discount.toLocaleString("fa-IR")}٪
                          </span>
                          <span className="text-[12px] text-muted-foreground line-through">{orig.number} {orig.unit}</span>
                        </div>
                      )}
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="text-[22px] font-black leading-none">{disc.number}</span>
                        <span className="text-[12px]">{disc.unit}</span>
                      </div>
                      {item.discountEndsAt && discount > 0 && (
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-dashed">
                          <span className="text-[11px] text-muted-foreground">اتمام تخفیف</span>
                          <DiscountTimer endsAt={item.discountEndsAt} />
                        </div>
                      )}
                    </div>
                  )}

                  {isUnavailable && (
                    <div className="text-center py-3">
                      <p className="text-[13px] font-bold text-muted-foreground">ناموجود</p>
                      <p className="text-[11px] text-muted-foreground mt-1">این کالا در حال حاضر موجود نیست</p>
                    </div>
                  )}

                  {priceAmount <= 0 && !item.priceLabel && !isUnavailable && (
                    <div className="text-center py-2 text-[13px]">تماس بگیرید برای قیمت</div>
                  )}

                  {/* CTA */}
                  <div className="space-y-2 pt-1">
                    <Button type="button" onClick={addToCart} disabled={isUnavailable} className="w-full bg-[#ef4056] hover:bg-[#e03a4f] text-white h-11 text-[13px] font-bold rounded-lg">
                      {isUnavailable ? "ناموجود" : "افزودن به سبد خرید"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs — مشخصات / دیدگاه */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-9">
            <Tabs defaultValue="specs" className="w-full" dir="rtl">
              <TabsList variant="line" className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 gap-6">
                <TabsTrigger value="specs" id="specs" className="rounded-none border-b-2 border-transparent data-active:border-[#ef394e] data-active:text-[#ef394e] px-1 py-3 text-[13px]">مشخصات</TabsTrigger>
                <TabsTrigger value="comments" className="rounded-none border-b-2 border-transparent data-active:border-[#ef394e] data-active:text-[#ef394e] px-1 py-3 text-[13px]">دیدگاه‌ها ({(item.comments ?? 0).toLocaleString("fa-IR")})</TabsTrigger>
              </TabsList>

              <TabsContent value="specs" className="pt-6">
                <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
                  <SpecsTableCategorized specs={item.specs as Record<string, unknown>} />
                </div>
              </TabsContent>

              <TabsContent value="comments" className="pt-2">
                <CommentSection module="shop" slug={item.slug} initialComments={item.comments || 0} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Left side in tabs area */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="rounded-lg border border-border bg-card p-3 text-[11px] text-muted-foreground leading-5">
              <p className="font-bold text-foreground mb-2">ضمانت اصالت</p>
              <p>تمام محصولات تکباکس دارای ضمانت اصالت و سلامت کالا هستند.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
