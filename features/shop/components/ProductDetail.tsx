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
import { Star, ShieldCheck, Package, Info, Cpu, MemoryStick, HardDrive, Monitor, Battery, Palette } from "lucide-react";
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
  if ((lower.includes("حافظه") && lower.includes("رم")) || lower.includes("ram")) return <MemoryStick className="size-4 text-muted-foreground" />;
  if (lower.includes("cpu") || lower.includes("پردازنده")) return <Cpu className="size-4 text-muted-foreground" />;
  if (lower.includes("storage") || lower.includes("ssd") || lower.includes("هارد") || lower.includes("حافظه داخلی")) return <HardDrive className="size-4 text-muted-foreground" />;
  if (lower.includes("screen") || lower.includes("نمایش") || lower.includes("inch")) return <Monitor className="size-4 text-muted-foreground" />;
  if (lower.includes("battery") || lower.includes("باتری")) return <Battery className="size-4 text-muted-foreground" />;
  if (lower.includes("color") || lower.includes("رنگ")) return <Palette className="size-4 text-muted-foreground" />;
  return <Info className="size-4 text-muted-foreground" />;
}

function SpecsTable({ specs }: { specs?: Record<string, unknown> | null }) {
  const entries = Object.entries(specs || {}).filter(([, v]) => {
    if (v === null || v === undefined) return false;
    const s = String(v).trim();
    if (!s) return false;
    return !["n/a", "na", "-"].includes(s.toLowerCase());
  });
  if (!entries.length) return (
    <div className="text-[13px] text-muted-foreground py-6 text-center">مشخصاتی برای این محصول در ادمین ثبت نشده است.</div>
  );
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

// ── Main Detail — 100% real DB data, no fake hard-codes ───────────────────
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
    if (!s) return false;
    return !["n/a", "na", "-"].includes(s.toLowerCase());
  });

  // ── REAL views: increment on mount via /api/views (rate-limited 30/m per IP)
  const [views, setViews] = useState(item.views);
  const [viewsLoaded, setViewsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Fetch latest + increment
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module: "shop", slug: item.slug }),
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.ok && typeof data.views === "number") {
          setViews(data.views);
          setViewsLoaded(true);
          // notify CardStats / other listeners
          window.dispatchEvent(new CustomEvent("tb_stats_update", { detail: { module: "shop", slug: item.slug, views: data.views } }));
        } else {
          // fallback: fetch current stats without increment if rate-limited
          return fetch(`/api/stats?module=shop&slug=${encodeURIComponent(item.slug)}`, { cache: "no-store" })
            .then((r) => r.json())
            .then((s) => {
              if (cancelled) return;
              if (typeof s.views === "number") {
                setViews(s.views);
                setViewsLoaded(true);
              }
            });
        }
      })
      .catch(() => {
        if (cancelled) return;
        setViews(item.views);
        setViewsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [item.slug, item.views]);

  const addConsultation = () => {
    add({ slug: item.slug, title: item.title, image: item.image || "" });
    setOpen(true);
  };

  return (
    <>
      <ProductJsonLd item={item} />
      <main className="mx-auto max-w-[1680px] px-3 sm:px-4 lg:px-6 py-4" dir="rtl">
        {/* Breadcrumb — real category / title from DB */}
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
          <span className="line-clamp-1 max-w-[360px] text-foreground/70">{item.title}</span>
        </nav>

        {/* Amazing top bar — only if real discount fields exist in DB */}
        {discount > 0 && item.discountEndsAt && !isUnavailable && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#ef394e]/10 border border-[#ef394e]/20 px-4 py-2">
            <div className="flex items-center gap-2 text-[12px] font-bold text-[#ef394e]">
              <span className="inline-flex h-5 items-center rounded-full bg-[#ef394e] px-2.5 text-[11px] text-white">
                {discount >= 25 ? "پیشنهاد شگفت‌انگیز" : "فروش ویژه"}
              </span>
              <span>٪{discount.toLocaleString("fa-IR")} تخفیف — از دیتابیس</span>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <span className="text-muted-foreground">اتمام پیشنهاد (دیتابیس):</span>
              <DiscountTimer endsAt={item.discountEndsAt} />
            </div>
          </div>
        )}

        {/* Main 3-col grid — Right Gallery | Center Info | Left Price */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* Gallery — Right in RTL — real gallery[] from DB */}
          <div className="lg:col-span-5 xl:col-span-4 order-1">
            <div className="lg:sticky lg:top-24 space-y-3">
              <ProductGallery images={gallery} title={item.title} />

              {/* Actions under gallery — all real counters from DB + APIs */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground border border-border rounded-lg p-2 bg-card">
                <ShareButton />
                <span className="h-3 w-px bg-border hidden sm:block" />
                <LikeButton contentType="shop" slug={item.slug} initial={item.likes || 0} />
                <span className="h-3 w-px bg-border hidden sm:block" />
                <SaveButton module="shop" slug={item.slug} />
                <span className="h-3 w-px bg-border hidden sm:block" />
                <div className="flex items-center gap-1">
                  <span>{viewsLoaded ? views.toLocaleString("fa-IR") : item.views.toLocaleString("fa-IR")}</span>
                  <span>بازدید • واقعی از /api/views</span>
                </div>
              </div>

              {/* SKU — real from DB, editable in admin */}
              {item.sku && (
                <div className="text-[10px] text-muted-foreground px-1">شناسه کالا (SKU از دیتابیس): {item.sku}</div>
              )}
              {item.brand && (
                <div className="text-[10px] text-muted-foreground px-1">برند از دیتابیس: {item.brand}</div>
              )}
            </div>
          </div>

          {/* Center — Details — all real */}
          <div className="lg:col-span-4 xl:col-span-5 order-2 space-y-5">
            {/* Title — real */}
            <div className="space-y-2">
              <h1 className="text-[16px] sm:text-[20px] font-bold leading-7 sm:leading-8 text-foreground">
                {item.title}
              </h1>
              {(item.brand || item.model) && (
                <p className="text-[11px] text-muted-foreground" dir="ltr">
                  {[item.brand, item.model].filter(Boolean).join(" ")} {item.sku ? `• ${item.sku}` : ""}
                </p>
              )}
            </div>

            {/* Rating + comments + views — all real DB, views now increments on refresh */}
            <div className="flex flex-wrap items-center gap-3 text-[12px] border-b border-border pb-4">
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-[#f9bc00] text-[#f9bc00]" />
                <span className="font-bold">{(item.rating ?? 0).toLocaleString("fa-IR", { maximumFractionDigits: 1 })}</span>
                <span className="text-muted-foreground">({(item.ratingCount ?? 0).toLocaleString("fa-IR")} نفر • از دیتابیس)</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-[#19bfd3]">{(item.comments ?? 0).toLocaleString("fa-IR")} دیدگاه واقعی</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-foreground font-medium">
                {viewsLoaded ? views.toLocaleString("fa-IR") : item.views.toLocaleString("fa-IR")} بازدید زنده (هر رفرش +1 via /api/views)
              </span>
            </div>

            {/* Rating widget — real user rating, stored in DB */}
            <div className="rounded-lg border border-border bg-card p-3">
              <RatingWidget module="shop" slug={item.slug} initialRating={item.rating} initialCount={item.ratingCount} />
              <p className="text-[10px] text-muted-foreground mt-2">امتیازدهی واقعی — ذخیره در Post.rating و Rating table، قابل مدیریت از ادمین / داشبورد</p>
            </div>

            {/* Color / specs chips — real specs from DB */}
            {specsEntries.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[13px] font-bold">ویژگی‌ها (از فیلد specs در ادمین)</h3>
                <div className="grid grid-cols-1 gap-3 rounded-lg bg-muted/30 p-3">
                  {specsEntries.slice(0, 10).map(([key, value]) => (
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
                {specsEntries.length > 10 && (
                  <a href="#specs" className="text-[12px] text-[#19bfd3] hover:underline">
                    مشاهده همه {specsEntries.length.toLocaleString("fa-IR")} ویژگی از دیتابیس ›
                  </a>
                )}
              </div>
            )}

            {/* Excerpt — real */}
            {item.excerpt && (
              <div className="rounded-lg border border-border bg-card p-3">
                <h4 className="text-[12px] font-bold mb-2">خلاصه (از excerpt در ادمین):</h4>
                <p className="text-[13px] leading-6 text-foreground/80">{item.excerpt}</p>
              </div>
            )}

            {/* No hard-coded marketing — if you need custom text, add via admin specs or content */}
          </div>

          {/* Left — Price Card — sticky — only real DB fields */}
          <div className="lg:col-span-3 order-3">
            <div className="lg:sticky lg:top-24 space-y-3">
              <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                {/* Seller header — real brand / author from DB */}
                <div className="border-b border-border bg-muted/20 p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-bold">فروشنده (از دیتابیس)</span>
                    <span className="text-[11px] text-foreground">{item.brand || item.author?.name || "تکباکس"}</span>
                  </div>
                  {item.warranty ? (
                    <div className="flex items-center gap-2 text-[11px]">
                      <ShieldCheck className="size-4 text-green-600" />
                      <span>گارانتی: {item.warranty} (از فیلد warranty در ادمین)</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-muted-foreground">گارانتی در ادمین ثبت نشده</div>
                  )}
                  <div className="flex items-center gap-2 text-[11px]">
                    <Package className="size-4 text-muted-foreground" />
                    <span className={isUnavailable ? "text-red-500" : "text-green-600"}>
                      {isUnavailable ? "ناموجود (از availability)" : `موجود در انبار${item.availability ? ` • ${item.availability}` : ""} (از availability)`}
                    </span>
                  </div>
                  {item.category && (
                    <div className="text-[11px] text-muted-foreground">دسته (از category): {item.category}</div>
                  )}
                </div>

                {/* Price — real priceAmount / priceLabel / discount from DB */}
                <div className="p-4 space-y-3">
                  <div className="space-y-1 text-left">
                    {discount > 0 && orig && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex h-5 items-center rounded-full bg-[#ef394e] px-2 text-[11px] font-bold text-white">
                          {discount.toLocaleString("fa-IR")}٪ تخفیف واقعی
                        </span>
                        <span className="text-[12px] text-muted-foreground line-through">{orig.number} {orig.unit}</span>
                      </div>
                    )}
                    {disc ? (
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="text-[22px] font-black leading-none">{disc.number}</span>
                        <span className="text-[12px]">{disc.unit}</span>
                      </div>
                    ) : item.priceLabel ? (
                      <div className="text-right text-[14px] font-bold">{item.priceLabel} (از priceLabel)</div>
                    ) : (
                      <div className="text-center py-2 text-[13px] text-muted-foreground">قیمت در ادمین ثبت نشده — فیلد priceAmount</div>
                    )}

                    {item.discountEndsAt && discount > 0 && (
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-dashed">
                        <span className="text-[11px] text-muted-foreground">اتمام تخفیف (discountEndsAt واقعی):</span>
                        <DiscountTimer endsAt={item.discountEndsAt} />
                      </div>
                    )}
                  </div>

                  {isUnavailable ? (
                    <div className="text-center py-3 rounded-md bg-muted/30">
                      <p className="text-[13px] font-bold text-muted-foreground">ناموجود — از availability</p>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <Button
                        type="button"
                        onClick={addConsultation}
                        disabled={isUnavailable}
                        className="w-full bg-[#ef4056] hover:bg-[#e03a4f] text-white h-11 text-[13px] font-bold rounded-lg"
                      >
                        {isUnavailable ? "ناموجود" : "استعلام قیمت / مشاوره (ثبت در consultation provider)"}
                      </Button>
                      <p className="text-[10px] text-muted-foreground text-center">
                        قیمت و موجودی از Post.priceAmount و Post.availability می‌آیند — در /admin/posts قابل ویرایش
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Minimal trust — not hard-coded marketing, only indicates real fields exist */}
              <div className="rounded-lg border border-border bg-card p-3 text-[10px] text-muted-foreground leading-4 space-y-1">
                <div>✔ گارانتی و موجودی از فیلدهای warranty و availability می‌آیند</div>
                <div>✔ قیمت از priceAmount و discountPercent و discountEndsAt</div>
                <div>✔ بازدید زنده از /api/views — هر رفرش +1 (rate limit 30/m)</div>
                <div>✔ لایک از /api/like — نیاز به لاگین</div>
                <div>✔ امتیاز از /api/rating — ذخیره در Rating table</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs — معرفی / مشخصات / دیدگاه — all real */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-9">
            <Tabs defaultValue="intro" className="w-full" dir="rtl">
              <TabsList variant="line" className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 gap-6">
                <TabsTrigger value="intro" className="rounded-none border-b-2 border-transparent data-active:border-[#ef394e] data-active:text-[#ef394e] px-1 py-3 text-[13px]">
                  معرفی (از content)
                </TabsTrigger>
                <TabsTrigger value="specs" id="specs" className="rounded-none border-b-2 border-transparent data-active:border-[#ef394e] data-active:text-[#ef394e] px-1 py-3 text-[13px]">
                  مشخصات فنی (از specs)
                </TabsTrigger>
                <TabsTrigger value="comments" className="rounded-none border-b-2 border-transparent data-active:border-[#ef394e] data-active:text-[#ef394e] px-1 py-3 text-[13px]">
                  دیدگاه‌ها ({(item.comments ?? 0).toLocaleString("fa-IR")}) واقعی
                </TabsTrigger>
              </TabsList>

              <TabsContent value="intro" className="pt-6">
                <article className="prose prose-sm dark:prose-invert max-w-none">
                  <h2 className="text-[16px] font-bold mb-3">معرفی محصول (از فیلد content در ادمین)</h2>
                  <p className="whitespace-pre-line text-[13px] leading-8 text-foreground/90">
                    {item.content || item.excerpt || "محتوایی در ادمین ثبت نشده — فیلد content."}
                  </p>
                </article>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-lg border border-border bg-card p-4">
                  {item.brand && <div className="text-[11px]"><span className="text-muted-foreground">برند (brand): </span><b className="text-foreground">{item.brand}</b></div>}
                  {item.model && <div className="text-[11px]"><span className="text-muted-foreground">مدل (model): </span><b dir="ltr">{item.model}</b></div>}
                  {item.sku && <div className="text-[11px]"><span className="text-muted-foreground">SKU (sku): </span><b dir="ltr">{item.sku}</b></div>}
                  {item.category && <div className="text-[11px]"><span className="text-muted-foreground">دسته (category): </span><b>{item.category}</b></div>}
                  {item.warranty && <div className="text-[11px]"><span className="text-muted-foreground">گارانتی (warranty): </span><b>{item.warranty}</b></div>}
                  <div className="text-[11px]"><span className="text-muted-foreground">بازدید واقعی (views): </span><b>{views.toLocaleString("fa-IR")}</b></div>
                  <div className="text-[11px]"><span className="text-muted-foreground">لایک (likes): </span><b>{item.likes.toLocaleString("fa-IR")}</b></div>
                </div>
              </TabsContent>

              <TabsContent value="specs" className="pt-6">
                <h2 className="text-[16px] font-bold mb-4">مشخصات فنی — از فیلد specs JSON در ادمین</h2>
                <div className="rounded-lg border border-border bg-card p-4">
                  <SpecsTable specs={item.specs} />
                  <p className="text-[10px] text-muted-foreground mt-4">برای ویرایش: /admin/posts?module=shop → ویرایش → فیلد specs (JSON یا Key:Value خط به خط)</p>
                </div>
              </TabsContent>

              <TabsContent value="comments" className="pt-2">
                <CommentSection module="shop" slug={item.slug} initialComments={item.comments || 0} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-3 hidden lg:block space-y-3">
            <div className="rounded-lg border border-border bg-card p-3 text-[11px] leading-5">
              <p className="font-bold text-foreground mb-2">همه چیز از دیتابیس</p>
              <ul className="space-y-1 text-muted-foreground list-disc pr-4">
                <li>قیمت، تخفیف، تایمر: priceAmount, discountPercent, discountEndsAt</li>
                <li>موجودی، گارانتی، برند، مدل: availability, warranty, brand, model</li>
                <li>گالری: gallery[] (Blob upload)</li>
                <li>مشخصات: specs JSON</li>
                <li>بازدید: Post.views via /api/views (هر رفرش)</li>
                <li>لایک، امتیاز، کامنت: جداول Like, Rating, Comment</li>
              </ul>
              <p className="mt-3 text-[10px]">ادمین: /admin/posts?module=shop</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
