"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/effects/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";
import { Trash2, Plus, GripVertical } from "lucide-react";
import type { ShopBannerItem } from "@/features/shop/components/ShopBanner";

function uid() { return Math.random().toString(36).slice(2, 10); }

export default function AdminShopBannersPage() {
  const [banners, setBanners] = useState<ShopBannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings?key=shop.banners", { cache: "no-store" });
      const data = await res.json();
      const raw = data["shop.banners"];
      if (raw) setBanners(JSON.parse(raw));
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "shop.banners": JSON.stringify(banners) }),
      });
      if (!res.ok) throw new Error();
      toast.success("بنرها ذخیره شدند");
    } catch { toast.error("خطا در ذخیره"); }
    setSaving(false);
  };

  const add = () => setBanners((b) => [...b, { id: uid(), image: "", title: "", subtitle: "", href: "", bgColor: "#f3f4f6" }]);
  const remove = (id: string) => setBanners((b) => b.filter((x) => x.id !== id));
  const update = (id: string, field: keyof ShopBannerItem, value: string) =>
    setBanners((b) => b.map((x) => (x.id === id ? { ...x, [field]: value } : x)));

  return (
    <main className="mx-auto max-w-4xl px-4 py-10" dir="rtl">
      <PageHeader colorVar="--shop" title="بنرهای فروشگاه" />
      <div className="space-y-4 mt-6">
        {loading ? (
          <p className="text-muted-foreground text-sm">در حال بارگذاری…</p>
        ) : banners.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">هیچ بنری تعریف نشده</p>
        ) : (
          banners.map((banner, idx) => (
            <Card key={banner.id}>
              <CardHeader className="pb-2 flex-row items-center gap-2">
                <GripVertical className="size-4 text-muted-foreground" />
                <CardTitle className="text-sm flex-1">بنر {(idx + 1).toLocaleString("fa-IR")}</CardTitle>
                <Button type="button" variant="ghost" size="icon-xs" onClick={() => remove(banner.id)}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">آدرس تصویر (URL)</Label>
                    <Input dir="ltr" value={banner.image} onChange={(e) => update(banner.id, "image", e.target.value)} placeholder="https://…/banner.jpg" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">لینک (اختیاری)</Label>
                    <Input dir="ltr" value={banner.href || ""} onChange={(e) => update(banner.id, "href", e.target.value)} placeholder="/shop/product-01" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">عنوان (اختیاری)</Label>
                    <Input value={banner.title || ""} onChange={(e) => update(banner.id, "title", e.target.value)} placeholder="پیشنهاد ویژه" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">زیرعنوان (اختیاری)</Label>
                    <Input value={banner.subtitle || ""} onChange={(e) => update(banner.id, "subtitle", e.target.value)} placeholder="تا ۳۰٪ تخفیف" />
                  </div>
                </div>
                {banner.image && (
                  <div className="relative h-20 rounded-lg overflow-hidden bg-muted">
                    <Image src={banner.image} alt="" fill className="object-cover" unoptimized />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={add} className="gap-2">
            <Plus className="size-4" /> افزودن بنر
          </Button>
          <Button type="button" onClick={save} loading={saving} disabled={saving}>ذخیره</Button>
        </div>
      </div>
    </main>
  );
}
