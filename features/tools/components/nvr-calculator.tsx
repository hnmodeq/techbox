"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HardDrive, Wifi, ArrowLeft, RotateCcw } from "lucide-react";

type Product = {
  slug: string;
  title: string;
  excerpt: string | null;
  image: string | null;
  brand: string | null;
  price: number | null;
  specs: Record<string, unknown>;
  availability: string | null;
};

const RESOLUTIONS = [
  { value: "720p", label: "720p (HD)", mbps: 2 },
  { value: "1080p", label: "1080p (فول‌اچ‌دی)", mbps: 4 },
  { value: "2k", label: "2K (کواد‌اچ‌دی)", mbps: 8 },
  { value: "4k", label: "4K (اولترا‌اچ‌دی)", mbps: 16 },
];

const HOURS = [
  { value: 8, label: "۸ ساعت (روزانه)" },
  { value: 12, label: "۱۲ ساعت (نیمه‌وقت)" },
  { value: 24, label: "۲۴ ساعت (شبانه‌روزی)" },
];

function formatSize(gb: number): string {
  if (gb < 1000) return `${gb.toLocaleString("fa-IR")} گیگابایت`;
  return `${(gb / 1000).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} ترابایت`;
}

function getBayCount(product: Product): number {
  const bay = product.specs?.["Bay"] || product.specs?.["bay"];
  if (!bay) return 0;
  const m = String(bay).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function scoreProduct(product: Product, requiredBays: number): number {
  let score = 50;
  const bay = getBayCount(product);
  if (bay >= requiredBays) score += 30;
  else if (bay >= requiredBays - 1) score += 10;
  else score -= 20;
  if (product.availability?.includes("موجود")) score += 10;
  return Math.max(0, Math.min(100, score));
}

export function NvrCalculator({ products = [] }: { products?: Product[] }) {
  const [cameras, setCameras] = useState(8);
  const [days, setDays] = useState(30);
  const [hours, setHours] = useState(24);
  const [resolution, setResolution] = useState("1080p");

  const selectedRes = RESOLUTIONS.find((r) => r.value === resolution) || RESOLUTIONS[1];

  const result = useMemo(() => {
    // Storage: cameras × (Mbps/8 → MB/s) × 3600s × hours/day × days → MB, then /1024 → GB
    const totalGb = Math.ceil((cameras * (selectedRes.mbps / 8) * 3600 * hours * days) / 1024);
    const bandwidthMbps = cameras * selectedRes.mbps;
    const raid = cameras >= 16 ? "رید ۶" : cameras >= 4 ? "رید ۵" : "رید ۱";
    const driveSizeTb = 4;
    const baysNeeded = Math.ceil(totalGb / 1024 / driveSizeTb);
    const recommendedBays = baysNeeded <= 1 ? 2 : baysNeeded <= 2 ? 4 : baysNeeded <= 4 ? 8 : baysNeeded <= 8 ? 12 : 16;
    return { totalGb, bandwidthMbps, raid, recommendedBays };
  }, [cameras, days, hours, selectedRes.mbps]);

  const recommendedProducts = useMemo(() => {
    if (products.length === 0) return [];
    return products
      .map((p) => ({ ...p, score: scoreProduct(p, result.recommendedBays) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [products, result.recommendedBays]);

  return (
    <div className="w-full max-w-xl space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">انتخاب ذخیره‌ساز دوربین</h1>
        <p className="text-sm text-muted-foreground">
          مشخصات سیستم دوربین مداربسته خود را وارد کنید تا فضای مورد نیاز را محاسبه کنیم.
        </p>
      </div>

      {/* Inputs */}
      <Card className="p-5 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">تعداد دوربین‌ها</label>
            <Badge variant="secondary">{cameras.toLocaleString("fa-IR")} عدد</Badge>
          </div>
          <input type="range" min={1} max={64} value={cameras} onChange={(e) => setCameras(parseInt(e.target.value))} className="w-full" />
          <div className="flex justify-between text-[10px] text-muted-foreground"><span>۱</span><span>۶۴</span></div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">مدت نگهداری تصاویر</label>
            <Badge variant="secondary">{days.toLocaleString("fa-IR")} روز</Badge>
          </div>
          <input type="range" min={1} max={365} value={days} onChange={(e) => setDays(parseInt(e.target.value))} className="w-full" />
          <div className="flex justify-between text-[10px] text-muted-foreground"><span>۱ روز</span><span>۳۶۵ روز</span></div>
        </div>

        <Separator />

        <div className="space-y-2">
          <label className="text-sm font-medium">ساعات ضبط روزانه</label>
          <div className="grid grid-cols-3 gap-2">
            {HOURS.map((h) => (
              <button key={h.value} type="button" onClick={() => setHours(h.value)}
                className={`rounded-lg border-2 p-2 text-xs font-medium text-center transition-all ${hours === h.value ? "border-primary bg-primary/5 text-primary" : "border-border/50 hover:border-primary/30"}`}>
                {h.label}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <label className="text-sm font-medium">رزولوشن دوربین‌ها</label>
          <div className="grid grid-cols-2 gap-2">
            {RESOLUTIONS.map((r) => (
              <button key={r.value} type="button" onClick={() => setResolution(r.value)}
                className={`rounded-lg border-2 p-2 text-xs font-medium text-center transition-all ${resolution === r.value ? "border-primary bg-primary/5 text-primary" : "border-border/50 hover:border-primary/30"}`}>
                {r.label}
                <div className="text-[10px] text-muted-foreground mt-0.5">{r.mbps} مگابیت/ثانیه</div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Results */}
      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-bold">نتیجه محاسبه</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border p-3 text-center">
            <HardDrive className="size-5 mx-auto text-primary mb-1" />
            <div className="text-lg font-bold">{formatSize(result.totalGb)}</div>
            <div className="text-[10px] text-muted-foreground">فضای مورد نیاز</div>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <Wifi className="size-5 mx-auto text-primary mb-1" />
            <div className="text-lg font-bold">{result.bandwidthMbps.toLocaleString("fa-IR")} مگابیت/ثانیه</div>
            <div className="text-[10px] text-muted-foreground">پهنای باند مورد نیاز</div>
          </div>
        </div>
        <Separator />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">تعداد دوربین:</span><span className="font-medium">{cameras.toLocaleString("fa-IR")} عدد</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">رزولوشن:</span><span className="font-medium">{selectedRes.label}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">ساعات ضبط:</span><span className="font-medium">{hours.toLocaleString("fa-IR")} ساعت در روز</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">مدت نگهداری:</span><span className="font-medium">{days.toLocaleString("fa-IR")} روز</span></div>
        </div>
        <Separator />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">پیشنهاد رید:</span><span className="font-medium">{result.raid}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">پیشنهاد تعداد درایو:</span><span className="font-medium">بالای {result.recommendedBays.toLocaleString("fa-IR")} درایو</span></div>
        </div>
      </Card>

      {/* Product Recommendations */}
      {recommendedProducts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold">پیشنهاد ذخیره‌ساز برای این سیستم</h3>
          {recommendedProducts.map((product, idx) => (
            <Link key={product.slug} href={`/shop/${product.slug}`} className="group block">
              <Card className="overflow-hidden hover:border-primary/20 transition-colors">
                <div className="flex gap-4 p-4">
                  {product.image && (
                    <div className="relative w-16 h-14 shrink-0 rounded overflow-hidden bg-muted">
                      <Image src={product.image} alt={product.title} fill sizes="64px" className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {idx === 0 && <Badge className="text-[9px]">⭐ بهترین</Badge>}
                      {product.brand && <Badge variant="outline" className="text-[9px]">{product.brand}</Badge>}
                    </div>
                    <div className="text-sm font-bold mt-0.5 group-hover:text-primary transition-colors truncate">{product.title}</div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                      {getBayCount(product) > 0 && <span>{getBayCount(product)} درایو</span>}
                      {product.price && <span className="font-bold text-primary">{product.price.toLocaleString("fa-IR")} تومان</span>}
                    </div>
                  </div>
                  <ArrowLeft className="size-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors self-center" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={() => { setCameras(8); setDays(30); setHours(24); setResolution("1080p"); }} className="gap-1.5">
          <RotateCcw className="size-3" />
          بازنشانی
        </Button>
        <Button onClick={() => window.open("/consultation", "_self")} className="gap-1.5">
          مشاوره رایگان
          <ArrowLeft className="size-3" />
        </Button>
      </div>
    </div>
  );
}
