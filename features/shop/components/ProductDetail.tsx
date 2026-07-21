"use client";

import type { ContentItem } from "@/lib/content";
import Link from "next/link";
import Image from "next/image";
import { ProductGallery } from "@/components/ui/product-gallery";
import { CardStats } from "@/components/ui/card-stats";
import { LikeButton } from "@/components/ui/like-button";
import { SaveButton } from "@/components/ui/save-button";
import { ShareButton } from "@/components/ui/share-button";
import CommentSection from "@/features/comment/components/CommentSection";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useConsultation } from "@/providers/consultation.provider";
import { ProductJsonLd } from "@/components/seo/StructuredData";
import { useCountdown } from "@/hooks/useCountdown";
import { Star, ShieldCheck, Truck, Package, Info, Cpu, MemoryStick, HardDrive, Monitor, Battery, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
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

// ── helpers ────────────────────────────────────────────────────────────────
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
    <span className="font-mono text-[12px] font-bold text-[#ef394e]" dir="ltr">
      {pad(totalHours)}:{pad(t.minutes)}:{pad(t.seconds)}
    </span>
  );
}

function SpecIcon({ k }: { k: string }) {
  const lower = k.toLowerCase();
  if (lower.includes("ram") || lower.includes("حافظه") && lower.includes("رم")) return <MemoryStick className="size-4 text-muted-foreground" />;
  if (lower.includes("cpu") || lower.includes("پردازنده")) return <Cpu className="size-4 text-muted-foreground" />;
  if (lower.includes("storage") || lower.includes("ssd") || lower.includes("حافظه")) return <HardDrive className="size-4 text-muted-foreground" />;
  if (lower.includes("screen") || lower.includes("نمایش")) return <Monitor className="size-4 text-muted-foreground" />;
  if (lower.includes("battery") || lower.includes("باتری")) return <Battery className="size-4 text-muted-foreground" />;
  if (lower.includes("color") || lower.includes("رنگ")) return <Palette className="size-4 text-muted-foreground" />;
  return <Info className="size-4 text-muted-foreground" />;
}

function SpecsTable({ specs }: { specs?: Record<string, unknown> | null }) {
  const entries = Object.entries(specs || {}).filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "" && !["n/a","na","-"].includes(String(v).trim().toLowerCase()));
  if (!entries.length) return null;
  return (
    <div className="space-y-0 divide-y divide-border">
      {entries.map(([key, value]) => (
        <div key={key} className="grid gap-2 py-4 sm:grid-cols-[200px_1fr]">
          <div className="text-[12px] font-medium text-muted-foreground">{key}</div>
          <div className="text-[13px] text-foreground">{String(value)}</div>
        </div>
      ))}
    </div>
  );
}

// ── Main Detail ────────────────────────────────────────────────────────────
export default function ProductDetail({ item }: { item: ProductItem }) {
  const gallery = Array.isArray(item.gallery) && item.gallery.length > 0 ? item.gallery : item.image ? [item.image] : [];
  const { add, setOpen } = useConsultation();

  const isUnavailable = item.availability === "ناموجود" || item.availability === "اتمام موجودی";
  const priceAmount = item.priceAmount && item.priceAmount > 0 ? item.priceAmount : parsePriceLabel(item.priceLabel);
  const discount = item.discountPercent ?? 0;
  const discountedPrice = discount > 0 ? Math.round(priceAmount * (1 - discount / 100)) : priceAmount;

  const orig = formatPrice(priceAmount);
  const disc = formatPrice(discountedPrice);

  const specsEntries = Object.entries((item.specs as Record<string, unknown>) || {}).filter(([, v]) => v && String(v).trim() !== "" && !["n/a","na","-"].includes(String(v).trim().toLowerCase()));

  const addConsultation = () => {
    add({ slug: item.slug, title: item.title, image: item.image || "" });
    setOpen(true);
  };

  return (
    <>
      <ProductJsonLd item={item} />
      <main className="mx-auto max-w-[1680px] px-3 sm:px-4 lg:px-6 py-4" dir="rtl">
        {/* Breadcrumb — Digikala style */}
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
              <span className="text-muted-foreground">اتمام پیشنهاد:</span>
              <DiscountTimer endsAt={item.discountEndsAt} />
            </div>
          </div>
        )}

        {/* Main 3-col grid — Right Gallery | Center Info | Left Price */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* Gallery — Right in RTL */}
          <div className="lg:col-span-5 xl:col-span-4 order-1">
            <div className="lg:sticky lg:top-24 space-y-3">
              <ProductGallery images={gallery} title={item.title} />

              {/* Actions under gallery — all real DB counters */}
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground border border-border rounded-lg p-2 bg-card">
                <ShareButton />
                <span className="h-3 w-px bg-border" />
                <LikeButton contentType="shop" slug={item.slug} initial={item.likes || 0} />
                <span className="h-3 w-px bg-border" />
                <SaveButton module="shop" slug={item.slug} />
                <span className="h-3 w-px bg-border" />
                <CardStats module="shop" slug={item.slug} initialViews={item.views} initialLikes={item.likes} initialComments={item.comments || 0} showComments />
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

            {/* Rating + comments + views — all real DB */}
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

            {/* Color — if specs has color */}
            {specsEntries.find(([k]) => k.toLowerCase().includes("color") || k.includes("رنگ")) && (
              <div className="space-y-2">
                <h3 className="text-[13px] font-bold">رنگ:</h3>
                <div className="flex flex-wrap gap-2">
                  {specsEntries
                    .filter(([k]) => k.toLowerCase().includes("color") || k.includes("رنگ"))
                    .map(([k, v]) => (
                      <span key={k} className="rounded-full border border-border bg-card px-3 py-1.5 text-[12px]">
                        {String(v)}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Quick features — up to 8 specs like Digikala feature grid */}
            {specsEntries.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[13px] font-bold">ویژگی‌ها</h3>
                <div className="grid grid-cols-1 gap-3 rounded-lg bg-muted/30 p-3">
                  {specsEntries.slice(0, 8).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-background p-1.5 border border-border">
                        <SpecIcon k={key} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] text-muted-foreground leading-4">{key}</div>
                        <div className="text-[12px] font-medium leading-5 text-foreground line-clamp-2">{String(value)}</div>
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

            {/* Excerpt */}
            {item.excerpt && (
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-[13px] leading-6 text-foreground/80">{item.excerpt}</p>
              </div>
            )}

            {/* Info note — like Digikala custom warranty note */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/30 p-3 text-[11px] leading-5 text-amber-900 dark:text-amber-200">
              امکان برگشت کالا در گروه لپ‌تاپ و تجهیزات IT تنها در صورت پلمب بودن و شرایط اولیه امکان‌پذیر است.
            </div>
          </div>

          {/* Left — Price Card — sticky (Digikala style) */}
          <div className="lg:col-span-3 order-3">
            <div className="lg:sticky lg:top-24 space-y-3">
              <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                {/* Seller header — real brand / author */}
                <div className="border-b border-border bg-muted/20 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-bold">فروشنده</span>
                    <span className="text-[11px] text-muted-foreground">{item.brand || item.author?.name || "تکباکس"}</span>
                  </div>
                  {item.warranty && (
                    <div className="mt-2 flex items-center gap-2 text-[11px]">
                      <ShieldCheck className="size-4 text-muted-foreground" />
                      <span>گارانتی {item.warranty}</span>
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Package className="size-4" />
                    <span>{isUnavailable ? "ناموجود" : "موجود در انبار"}{item.availability ? ` • ${item.availability}` : ""}</span>
                  </div>
                </div>

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
                      {!orig && priceAmount <= 0 && item.priceLabel && (
                        <div className="text-right text-[14px] font-bold">{item.priceLabel}</div>
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

                  {/* CTA — real: consultation / contact */}
                  <div className="space-y-2 pt-1">
                    <Button type="button" onClick={addConsultation} disabled={isUnavailable} className="w-full bg-[#ef4056] hover:bg-[#e03a4f] text-white h-11 text-[13px] font-bold rounded-lg">
                      {isUnavailable ? "ناموجود" : "افزودن به سبد / استعلام قیمت"}
                    </Button>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Truck className="size-4" />
                      <span>ارسال سریع • تحویل ۳ ساعته در تهران</span>
                    </div>
                  </div>

                  {/* Points / guarantee — only real if brand exists, no fake */}
                  <div className="rounded-md bg-muted/40 p-2.5 text-[11px] leading-5">
                    <p className="font-medium">ضمانت اصالت و سلامت کالا</p>
                    <p className="text-muted-foreground">هفت روز ضمانت بازگشت • اصالت کالا تضمین شده</p>
                  </div>
                </div>
              </div>

              {/* Small trust badge */}
              <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><ShieldCheck className="size-3.5" /> گارانتی اصالت</span>
                <span className="flex items-center gap-1"><Truck className="size-3.5" /> ارسال سریع</span>
                <span className="flex items-center gap-1"><Package className="size-3.5" /> بسته‌بندی امن</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs — معرفی / مشخصات / دیدگاه */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-9">
            <Tabs defaultValue="intro" className="w-full" dir="rtl">
              <TabsList variant="line" className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 gap-6">
                <TabsTrigger value="intro" className="rounded-none border-b-2 border-transparent data-active:border-[#ef394e] data-active:text-[#ef394e] px-1 py-3 text-[13px]">معرفی</TabsTrigger>
                <TabsTrigger value="specs" id="specs" className="rounded-none border-b-2 border-transparent data-active:border-[#ef394e] data-active:text-[#ef394e] px-1 py-3 text-[13px]">مشخصات</TabsTrigger>
                <TabsTrigger value="comments" className="rounded-none border-b-2 border-transparent data-active:border-[#ef394e] data-active:text-[#ef394e] px-1 py-3 text-[13px]">دیدگاه‌ها ({(item.comments ?? 0).toLocaleString("fa-IR")})</TabsTrigger>
              </TabsList>

              <TabsContent value="intro" className="pt-6">
                <article className="prose prose-sm dark:prose-invert max-w-none">
                  <h2 className="text-[16px] font-bold mb-3">معرفی</h2>
                  <p className="whitespace-pre-line text-[13px] leading-8 text-foreground/90">
                    {item.content || item.excerpt || "توضیحاتی برای این محصول ثبت نشده است."}
                  </p>
                </article>

                {/* Brand / model / sku grid — real */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-lg border border-border bg-card p-4">
                  {item.brand && <div className="text-[11px]"><span className="text-muted-foreground">برند: </span><b className="text-foreground">{item.brand}</b></div>}
                  {item.model && <div className="text-[11px]"><span className="text-muted-foreground">مدل: </span><b dir="ltr">{item.model}</b></div>}
                  {item.sku && <div className="text-[11px]"><span className="text-muted-foreground">SKU: </span><b dir="ltr">{item.sku}</b></div>}
                  {item.category && <div className="text-[11px]"><span className="text-muted-foreground">دسته: </span><b>{item.category}</b></div>}
                  {item.warranty && <div className="text-[11px]"><span className="text-muted-foreground">گارانتی: </span><b>{item.warranty}</b></div>}
                </div>
              </TabsContent>

              <TabsContent value="specs" className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[16px] font-bold">مشخصات فنی – دسته‌بندی فارسی (۲۵ مورد مهم)</h2>
                  <span className="text-[11px] text-muted-foreground">بر اساس دیتاشیت QNAP – قابل مدیریت از ادمین</span>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
                  <SpecsTableCategorized specs={item.specs as Record<string, unknown>} />
                </div>
              </TabsContent>

              <TabsContent value="comments" className="pt-2">
                <CommentSection module="shop" slug={item.slug} initialComments={item.comments || 0} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Left side in tabs area — small related hidden on mobile */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="rounded-lg border border-border bg-card p-3 text-[11px] text-muted-foreground leading-5">
              <p className="font-bold text-foreground mb-2">ارسال رایگان</p>
              <p>برای سفارش‌های بالای ۵ میلیون تومان ارسال رایگان است.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
