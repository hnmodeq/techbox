"use client";

import type { ContentItem } from "@/lib/content";
import Link from "next/link";
import { ProductGallery } from "@/components/ui/product-gallery";
import { LikeButton } from "@/components/ui/like-button";
import { SaveButton } from "@/components/ui/save-button";
import { ShareButton } from "@/components/ui/share-button";
import { RatingWidget } from "@/components/ui/rating-widget";
import CommentSection from "@/features/comment/components/CommentSection";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useConsultation } from "@/providers/consultation.provider";
import { ProductJsonLd } from "@/components/seo/StructuredData";
import { useCountdown } from "@/hooks/useCountdown";
import { Star, ShieldCheck, Package, Truck, Info, Cpu, MemoryStick, HardDrive, Monitor, Battery, Palette } from "lucide-react";
import { useEffect, useState } from "react";

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
  const num = parseFloat(ascii.replace(/[^\\d.]/g, ""));
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
    <span className="font-mono text-[11px] font-bold text-[#ef394e]" dir="ltr">
      {pad(totalHours)}:{pad(t.minutes)}:{pad(t.seconds)}
    </span>
  );
}

function SpecIcon({ k }: { k: string }) {
  const l = k.toLowerCase();
  if (l.includes("ram") || (l.includes("حافظه") && l.includes("رم"))) return <MemoryStick className="size-4 text-muted-foreground" />;
  if (l.includes("cpu") || l.includes("پردازنده")) return <Cpu className="size-4 text-muted-foreground" />;
  if (l.includes("ssd") || l.includes("hdd") || l.includes("storage") || l.includes("حافظه داخلی")) return <HardDrive className="size-4 text-muted-foreground" />;
  if (l.includes("screen") || l.includes("نمایش") || l.includes("inch")) return <Monitor className="size-4 text-muted-foreground" />;
  if (l.includes("battery") || l.includes("باتری")) return <Battery className="size-4 text-muted-foreground" />;
  if (l.includes("color") || l.includes("رنگ")) return <Palette className="size-4 text-muted-foreground" />;
  return <Info className="size-4 text-muted-foreground" />;
}

function SpecsTable({ specs }: { specs?: Record<string, unknown> | null }) {
  const entries = Object.entries(specs || {}).filter(([, v]) => {
    if (v === null || v === undefined) return false;
    const s = String(v).trim();
    return s && !["n/a", "na", "-"].includes(s.toLowerCase());
  });
  if (!entries.length) return <p className="text-[13px] text-muted-foreground py-8 text-center">مشخصاتی ثبت نشده است.</p>;
  return (
    <div className="divide-y divide-border">
      {entries.map(([k, v]) => (
        <div key={k} className="grid gap-2 py-4 sm:grid-cols-[180px_1fr]">
          <div className="text-[12px] text-muted-foreground">{k}</div>
          <div className="text-[13px] font-medium">{String(v)}</div>
        </div>
      ))}
    </div>
  );
}

export default function ProductDetail({ item }: { item: ProductItem }) {
  const gallery = Array.isArray(item.gallery) && item.gallery.length > 0 ? item.gallery : item.image ? [item.image] : [];
  const { add, setOpen } = useConsultation();

  const isUnavailable = item.availability === "ناموجود" || item.availability === "اتمام موجودی";
  const priceAmount = item.priceAmount && item.priceAmount > 0 ? item.priceAmount : parsePriceLabel(item.priceLabel);
  const discount = item.discountPercent ?? 0;
  const discountedPrice = discount > 0 ? Math.round(priceAmount * (1 - discount / 100)) : priceAmount;

  const orig = formatPrice(priceAmount);
  const disc = formatPrice(discountedPrice);

  const specsEntries = Object.entries((item.specs as Record<string, unknown>) || {}).filter(([, v]) => {
    if (v === null || v === undefined) return false;
    const s = String(v).trim();
    return s && !["n/a", "na", "-"].includes(s.toLowerCase());
  });

  const [views, setViews] = useState(item.views);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module: "shop", slug: item.slug }),
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.ok && typeof d.views === "number") {
          setViews(d.views);
          window.dispatchEvent(new CustomEvent("tb_stats_update", { detail: { module: "shop", slug: item.slug, views: d.views } }));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [item.slug]);

  const addConsultation = () => {
    add({ slug: item.slug, title: item.title, image: item.image || "" });
    setOpen(true);
  };

  return (
    <>
      <ProductJsonLd item={item} />
      <main className="mx-auto max-w-[1680px] px-3 sm:px-4 lg:px-6 py-4" dir="rtl">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
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
          <span className="line-clamp-1 max-w-[320px] text-foreground/70">{item.title}</span>
        </nav>

        {/* Amazing bar */}
        {discount > 0 && item.discountEndsAt && !isUnavailable && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#ef394e]/10 border border-[#ef394e]/20 px-4 py-2.5">
            <div className="flex items-center gap-2 text-[12px] font-bold text-[#ef394e]">
              <span className="inline-flex h-5 items-center rounded-full bg-[#ef394e] px-2.5 text-[11px] text-white">
                {discount >= 25 ? "پیشنهاد شگفت‌انگیز" : "فروش ویژه"}
              </span>
              <span>٪{discount.toLocaleString("fa-IR")} تخفیف</span>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <span className="text-muted-foreground">اتمام پیشنهاد:</span>
              <DiscountTimer endsAt={item.discountEndsAt} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
          {/* Gallery */}
          <div className="lg:col-span-5 xl:col-span-4 order-1">
            <div className="lg:sticky lg:top-24 space-y-3">
              <ProductGallery images={gallery} title={item.title} />
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground border border-border rounded-lg p-2.5 bg-card">
                <ShareButton />
                <span className="h-4 w-px bg-border" />
                <LikeButton contentType="shop" slug={item.slug} initial={item.likes || 0} />
                <span className="h-4 w-px bg-border" />
                <SaveButton module="shop" slug={item.slug} />
              </div>
            </div>
          </div>

          {/* Center */}
          <div className="lg:col-span-4 xl:col-span-5 order-2 space-y-5">
            <div className="space-y-2">
              <h1 className="text-[17px] sm:text-[21px] font-bold leading-7 sm:leading-8">{item.title}</h1>
              {(item.brand || item.model) && (
                <p className="text-[12px] text-muted-foreground" dir="ltr">
                  {[item.brand, item.model].filter(Boolean).join(" ")}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[12px] border-b pb-4">
              <span className="flex items-center gap-1">
                <Star className="size-4 fill-[#f9bc00] text-[#f9bc00]" />
                <b>{(item.rating ?? 0).toLocaleString("fa-IR", { maximumFractionDigits: 1 })}</b>
                <span className="text-muted-foreground">({(item.ratingCount ?? 0).toLocaleString("fa-IR")})</span>
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-[#19bfd3]">{(item.comments ?? 0).toLocaleString("fa-IR")} دیدگاه</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{views.toLocaleString("fa-IR")} بازدید</span>
            </div>

            <div className="rounded-lg border bg-card p-3">
              <RatingWidget module="shop" slug={item.slug} initialRating={item.rating} initialCount={item.ratingCount} />
            </div>

            {specsEntries.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[13px] font-bold">ویژگی‌ها</h3>
                <div className="grid grid-cols-1 gap-3 rounded-lg bg-muted/30 p-3">
                  {specsEntries.slice(0, 8).map(([k, v]) => (
                    <div key={k} className="flex items-start gap-3">
                      <div className="rounded-full bg-background p-1.5 border">
                        <SpecIcon k={k} />
                      </div>
                      <div className="flex-1">
                        <div className="text-[11px] text-muted-foreground">{k}</div>
                        <div className="text-[12px] font-medium line-clamp-2">{String(v)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {specsEntries.length > 8 && (
                  <a href="#specs" className="text-[12px] text-[#19bfd3] hover:underline">
                    مشاهده همه ویژگی‌ها {specsEntries.length.toLocaleString("fa-IR")} مورد ›
                  </a>
                )}
              </div>
            )}

            {item.excerpt && (
              <div className="rounded-lg border bg-card p-3 text-[13px] leading-6 text-foreground/80">{item.excerpt}</div>
            )}
          </div>

          {/* Price Card */}
          <div className="lg:col-span-3 order-3">
            <div className="lg:sticky lg:top-24 space-y-3">
              <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                <div className="border-b bg-muted/20 p-3 space-y-2">
                  <div className="flex justify-between text-[12px]">
                    <b>فروشنده</b>
                    <span className="text-muted-foreground">{item.brand || item.author?.name || "تکباکس"}</span>
                  </div>
                  {item.warranty && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <ShieldCheck className="size-4 text-green-600" />
                      <span>{item.warranty}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Package className="size-4" />
                    <span className={isUnavailable ? "text-red-500" : "text-green-600"}>{isUnavailable ? "ناموجود" : item.availability || "موجود در انبار"}</span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {!isUnavailable && (disc || orig) ? (
                    <div className="space-y-2">
                      {discount > 0 && orig && (
                        <div className="flex justify-between items-center">
                          <span className="rounded-full bg-[#ef394e] text-white text-[11px] px-2 py-0.5 font-bold">٪{discount.toLocaleString("fa-IR")}</span>
                          <span className="text-[12px] line-through text-muted-foreground">{orig.number} {orig.unit}</span>
                        </div>
                      )}
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="text-[22px] font-black">{disc ? disc.number : ""}</span>
                        <span className="text-[12px]">{disc ? disc.unit : item.priceLabel || ""}</span>
                      </div>
                      {item.discountEndsAt && discount > 0 && (
                        <div className="flex justify-between pt-2 border-t border-dashed text-[11px]">
                          <span className="text-muted-foreground">زمان باقیمانده</span>
                          <DiscountTimer endsAt={item.discountEndsAt} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-3 text-sm text-muted-foreground">{isUnavailable ? "ناموجود" : item.priceLabel || "تماس بگیرید"}</div>
                  )}

                  <Button onClick={addConsultation} disabled={isUnavailable} className="w-full bg-[#ef4056] hover:bg-[#e03a4f] text-white h-11 font-bold">
                    {isUnavailable ? "ناموجود" : "افزودن به سبد خرید"}
                  </Button>

                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Truck className="size-4" />
                    <span>ارسال سریع</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between rounded-lg border bg-card p-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><ShieldCheck className="size-3.5" /> ضمانت اصالت</span>
                <span className="flex items-center gap-1"><Truck className="size-3.5" /> ارسال سریع</span>
                <span className="flex items-center gap-1"><Package className="size-3.5" /> بسته‌بندی امن</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10">
          <Tabs defaultValue="intro" dir="rtl">
            <TabsList variant="line" className="w-full justify-start border-b bg-transparent gap-6 rounded-none">
              <TabsTrigger value="intro" className="data-active:border-[#ef394e] data-active:text-[#ef394e] border-b-2 border-transparent px-1 py-3 text-[13px]">معرفی</TabsTrigger>
              <TabsTrigger value="specs" id="specs" className="data-active:border-[#ef394e] data-active:text-[#ef394e] border-b-2 border-transparent px-1 py-3 text-[13px]">مشخصات</TabsTrigger>
              <TabsTrigger value="comments" className="data-active:border-[#ef394e] data-active:text-[#ef394e] border-b-2 border-transparent px-1 py-3 text-[13px]">دیدگاه‌ها ({(item.comments ?? 0).toLocaleString("fa-IR")})</TabsTrigger>
            </TabsList>
            <TabsContent value="intro" className="pt-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <h2 className="text-[16px] font-bold mb-3">معرفی</h2>
                <p className="whitespace-pre-line text-[13px] leading-8">{item.content || item.excerpt || "توضیحاتی ثبت نشده است."}</p>
              </div>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-lg border bg-card p-4 text-[11px]">
                {item.brand && <div><span className="text-muted-foreground">برند:</span> <b>{item.brand}</b></div>}
                {item.model && <div><span className="text-muted-foreground">مدل:</span> <b dir="ltr">{item.model}</b></div>}
                {item.sku && <div><span className="text-muted-foreground">SKU:</span> <b dir="ltr">{item.sku}</b></div>}
                {item.category && <div><span className="text-muted-foreground">دسته:</span> <b>{item.category}</b></div>}
                {item.warranty && <div><span className="text-muted-foreground">گارانتی:</span> <b>{item.warranty}</b></div>}
                <div><span className="text-muted-foreground">بازدید:</span> <b>{views.toLocaleString("fa-IR")}</b></div>
              </div>
            </TabsContent>
            <TabsContent value="specs" className="pt-6">
              <h2 className="text-[16px] font-bold mb-4">مشخصات فنی</h2>
              <div className="rounded-lg border bg-card p-4">
                <SpecsTable specs={item.specs} />
              </div>
            </TabsContent>
            <TabsContent value="comments" className="pt-4">
              <CommentSection module="shop" slug={item.slug} initialComments={item.comments || 0} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
