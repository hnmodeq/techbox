"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/layout/admin-guard";
import { AdminLoading } from "@/components/admin/admin-states";
import PageHeader from "@/components/effects/PageHeader";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  HOME_AD_PLACEMENTS,
  type HomeAdvertisement,
  type HomeAdPlacement,
} from "@/features/home/lib/home-advertisements";

const PLACEMENT_LABELS: Record<HomeAdPlacement, string> = {
  magazine: "بالای بخش مجله",
  video: "بالای بخش ویدیوها",
  insights: "بالای بخش تازه‌ترین دیدگاه‌ها",
  finder: "بالای بخش جستجوگر",
  topPicks: "بالای بخش بررسی‌ها",
  timeline: "بالای بخش گاه‌شمار",
  deals: "بالای بخش فروشگاه",
  tools: "بالای بخش ابزارها",
  community: "بالای بخش انجمن",
  websiteInfo: "بالای بخش اطلاعات سایت",
  partners: "بالای بخش همکاران تجاری",
  siteTop: "نوار تبلیغاتی بالای هدر سایت",
  sidebarPrimary: "تبلیغ اول نوار کناری اصلی",
  sidebarSecondary: "تبلیغ دوم نوار کناری اصلی",
};

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `advertisement-${Date.now()}`;
}

function AdvertisementsContent() {
  const [advertisements, setAdvertisements] = React.useState<HomeAdvertisement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploadingId, setUploadingId] = React.useState<string | null>(null);
  const [usingDefaults, setUsingDefaults] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/home-advertisements", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "advertisements_load_failed");
      setAdvertisements(Array.isArray(data.advertisements) ? data.advertisements : []);
      setUsingDefaults(Boolean(data.usingDefaults));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "خطا در دریافت تبلیغات");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const update = <K extends keyof HomeAdvertisement>(
    id: string,
    key: K,
    value: HomeAdvertisement[K],
  ) => {
    setAdvertisements((current) =>
      current.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    );
  };

  const add = () => {
    setAdvertisements((current) => [
      ...current,
      {
        id: newId(),
        image: "",
        alt: "",
        href: undefined,
        section: "magazine",
        enabled: true,
        order: current.length,
        version: 1,
      },
    ]);
  };

  const remove = (id: string) => {
    setAdvertisements((current) =>
      current.filter((item) => item.id !== id).map((item, order) => ({ ...item, order })),
    );
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= advertisements.length) return;
    setAdvertisements((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((item, order) => ({ ...item, order }));
    });
  };

  const upload = async (advertisement: HomeAdvertisement, file: File | undefined) => {
    if (!file) return;
    if (!["image/webp", "image/gif"].includes(file.type) || !/\.(?:webp|gif)$/i.test(file.name)) {
      toast.error("فقط فایل WebP یا GIF انتخاب کنید.");
      return;
    }

    setUploadingId(advertisement.id);
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/admin/home-advertisements/upload", {
        method: "POST",
        body: form,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || data?.error || "upload_failed");
      update(advertisement.id, "image", data.url);
      if (!advertisement.alt.trim()) {
        update(advertisement.id, "alt", file.name.replace(/\.(?:webp|gif)$/i, "").replace(/[-_]+/g, " "));
      }
      toast.success("تصویر تبلیغاتی آپلود شد.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "خطا در آپلود تصویر");
    } finally {
      setUploadingId(null);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      // A save represents a new campaign revision. Incrementing the version
      // intentionally makes edited creatives visible again to visitors who
      // dismissed the previous revision in the same browser session.
      const payload = advertisements.map((item, order) => ({
        ...item,
        href: item.href?.trim() || "",
        order,
        version: item.version + 1,
      }));
      const response = await fetch("/api/admin/home-advertisements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        const issue = Array.isArray(data?.issues) ? data.issues[0]?.message : null;
        throw new Error(issue || data?.error || "advertisements_save_failed");
      }
      setAdvertisements(data.advertisements || payload);
      setUsingDefaults(false);
      toast.success("تبلیغات سایت ذخیره شد.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "خطا در ذخیره تبلیغات");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-dvh px-4 py-10" dir="rtl">
      <section className="mx-auto max-w-5xl space-y-6">
        <PageHeader
          colorVar="--admin"
          title="مدیریت تبلیغات سایت"
          titleClassName="text-[var(--admin)]"
          description="آپلود WebP یا GIF، تعیین جایگاه، ترتیب و وضعیت نمایش بنرها"
        >
          <ButtonLink href="/" variant="ghost" size="sm">پیش‌نمایش سایت</ButtonLink>
          <Button type="button" variant="ghost" size="sm" onClick={load} disabled={loading || saving}>
            به‌روزرسانی
          </Button>
        </PageHeader>

        {usingDefaults && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs leading-6 text-foreground">
            بنرهای فعلی از مجموعه اولیه استفاده می‌کنند. با اولین ذخیره، همین فهرست در تنظیمات سایت ثبت و کاملاً قابل مدیریت می‌شود.
          </div>
        )}

        {loading ? (
          <AdminLoading rows={4} />
        ) : advertisements.length === 0 ? (
          <Card className="p-10 text-center">
            <ImagePlus className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="text-sm font-semibold">هیچ تبلیغی تعریف نشده است.</p>
            <p className="mt-1 text-xs text-muted-foreground">برای ساخت اولین جایگاه، یک بنر WebP یا GIF اضافه کنید.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {advertisements.map((advertisement, index) => (
              <Card key={advertisement.id} className={!advertisement.enabled ? "opacity-65" : undefined}>
                <CardHeader className="flex-row items-center gap-3 border-b pb-3">
                  <div className="flex size-8 items-center justify-center rounded-md bg-muted text-xs font-bold">
                    {(index + 1).toLocaleString("fa-IR")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-sm">{advertisement.alt || "تبلیغ بدون عنوان"}</CardTitle>
                    <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground" dir="ltr">
                      {advertisement.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button type="button" variant="ghost" size="icon-xs" onClick={() => move(index, -1)} disabled={index === 0} aria-label="انتقال به بالا">
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon-xs" onClick={() => move(index, 1)} disabled={index === advertisements.length - 1} aria-label="انتقال به پایین">
                      <ArrowDown className="size-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon-xs" onClick={() => remove(advertisement.id)} aria-label="حذف تبلیغ">
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-4">
                  {advertisement.image ? (
                    <div className="relative aspect-[24/5] overflow-hidden rounded-lg bg-black">
                      <Image
                        src={advertisement.image}
                        alt={advertisement.alt || "پیش‌نمایش تبلیغ"}
                        fill
                        sizes="(max-width: 1024px) 100vw, 900px"
                        unoptimized
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[24/5] items-center justify-center rounded-lg border border-dashed bg-muted/30 text-xs text-muted-foreground">
                      ابتدا یک فایل WebP یا GIF آپلود کنید
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor={`ad-alt-${advertisement.id}`}>متن جایگزین تصویر</Label>
                      <Input
                        id={`ad-alt-${advertisement.id}`}
                        value={advertisement.alt}
                        onChange={(event) => update(advertisement.id, "alt", event.target.value)}
                        placeholder="شرح کوتاه و دقیق تبلیغ"
                        maxLength={180}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`ad-href-${advertisement.id}`}>لینک مقصد (اختیاری)</Label>
                      <Input
                        id={`ad-href-${advertisement.id}`}
                        dir="ltr"
                        value={advertisement.href || ""}
                        onChange={(event) => update(advertisement.id, "href", event.target.value)}
                        placeholder="https://example.com/campaign"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`ad-placement-${advertisement.id}`}>جایگاه نمایش</Label>
                      <select
                        id={`ad-placement-${advertisement.id}`}
                        value={advertisement.section}
                        onChange={(event) => update(advertisement.id, "section", event.target.value as HomeAdPlacement)}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {HOME_AD_PLACEMENTS.map((placement) => (
                          <option key={placement} value={placement}>{PLACEMENT_LABELS[placement]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`ad-image-${advertisement.id}`}>آدرس تصویر</Label>
                      <Input
                        id={`ad-image-${advertisement.id}`}
                        dir="ltr"
                        value={advertisement.image}
                        onChange={(event) => update(advertisement.id, "image", event.target.value)}
                        placeholder="https://…/advertisement.webp یا .gif"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={advertisement.enabled}
                        onCheckedChange={(checked) => update(advertisement.id, "enabled", checked)}
                        aria-label="فعال بودن تبلیغ"
                      />
                      <div>
                        <p className="text-xs font-semibold">نمایش در صفحه اصلی</p>
                        <p className="text-[11px] text-muted-foreground">{advertisement.enabled ? "فعال" : "غیرفعال"}</p>
                      </div>
                    </div>

                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold transition-colors hover:bg-muted">
                      <Upload className="size-4" />
                      {uploadingId === advertisement.id ? "در حال آپلود…" : "آپلود WebP / GIF"}
                      <input
                        type="file"
                        accept="image/webp,image/gif,.webp,.gif"
                        className="sr-only"
                        disabled={uploadingId !== null}
                        onChange={(event) => {
                          void upload(advertisement, event.target.files?.[0]);
                          event.currentTarget.value = "";
                        }}
                      />
                    </label>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="outline" onClick={add} className="gap-2">
            <Plus className="size-4" /> افزودن تبلیغ
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={load} disabled={loading || saving}>انصراف</Button>
            <Button type="button" onClick={save} loading={saving} disabled={loading || saving || uploadingId !== null}>
              ذخیره تبلیغات
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function AdminHomeAdvertisementsPage() {
  return (
    <AdminGuard>
      {() => <AdvertisementsContent />}
    </AdminGuard>
  );
}
