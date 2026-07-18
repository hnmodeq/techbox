"use client";

import { useEffect, useState, useCallback } from "react";
import PageHeader from "@/components/effects/PageHeader";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

// Display order + slug label
const MODULES: Array<{ slug: string; label: string }> = [
  { slug: "blog", label: "مجله / Blog" },
  { slug: "news", label: "اخبار / News" },
  { slug: "media", label: "رسانه / Media" },
  { slug: "shop", label: "فروشگاه / Shop" },
  { slug: "forum", label: "انجمن / Forum" },
  { slug: "review", label: "نقد و بررسی / Review" },
  { slug: "download", label: "دانلود / Download" },
  { slug: "tools", label: "ابزارها / Tools" },
  { slug: "timeline", label: "تایم‌لاین / Timeline" },
];

export default function AdminModuleNamesPage() {
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [defaults, setDefaults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/module-names", { cache: "no-store" });
      if (!res.ok) throw new Error("load_failed");
      const data = await res.json();
      setTitles(data.titles || {});
      setDefaults(data.defaults || {});
    } catch {
      toast.error("خطا در بارگذاری");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/module-names", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(titles),
      });
      if (res.ok) toast.success("نام ماژول‌ها ذخیره شد و در سراسر سایت اعمال شد");
      else toast.error("خطا در ذخیره");
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setTitles({ ...defaults });
    toast.info("بازگشت به پیش‌فرض (برای اعمال، ذخیره کنید)");
  };

  return (
    <main className="min-h-dvh px-4 py-10" dir="rtl">
      <Toaster dir="rtl" />
      <section className="mx-auto max-w-2xl space-y-6">
        <PageHeader colorVar="--admin" title="نام ماژول‌ها" titleClassName="text-[var(--admin)]" description="منبع واحد نام نمایشی ماژول‌ها — تغییر در همه‌جا اعمال می‌شود (سایدبار، تیکبار، پیشنهادها، فعالیت کاربر، ردیف‌های خانه، بج‌ها و سئو)">
          <ButtonLink href="/admin" variant="ghost" size="sm">داشبورد</ButtonLink>
        </PageHeader>

        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-base">نام نمایشی هر ماژول</CardTitle>
            <CardDescription>نام فارسی نمایش داده‌شده به کاربر را ویرایش کنید.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            {loading ? (
              MODULES.map((m) => (
                <div key={m.slug} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              ))
            ) : (
              MODULES.map((m) => {
                const isCustom = titles[m.slug] && titles[m.slug] !== defaults[m.slug];
                return (
                  <div key={m.slug} className="grid grid-cols-[1fr_1.4fr] items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{m.label}</span>
                      {isCustom && <Badge variant="secondary" className="text-[10px]">شخصی‌سازی‌شده</Badge>}
                    </div>
                    <Input
                      value={titles[m.slug] ?? ""}
                      onChange={(e) => setTitles((t) => ({ ...t, [m.slug]: e.target.value }))}
                      placeholder={defaults[m.slug] || m.slug}
                      className="h-9"
                    />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={reset} disabled={loading || saving}>بازگشت به پیش‌فرض</Button>
          <Button onClick={save} disabled={loading || saving} loading={saving}>ذخیره</Button>
        </div>
      </section>
    </main>
  );
}
