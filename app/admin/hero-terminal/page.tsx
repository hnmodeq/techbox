"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth.provider";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import PageHeader from "@/components/effects/PageHeader";
import { TerminalHero } from "@/components/effects/TerminalHero";
import { PlusIcon, TrashIcon, GripVerticalIcon } from "lucide-react";

export default function HeroTerminalAdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [lines, setLines] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "super_admin")) router.push("/admin");
  }, [user, loading, router]);

  useEffect(() => {
    fetch("/api/admin/hero-terminal")
      .then((r) => r.json())
      .then((d) => setLines(d.lines || []))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const save = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/hero-terminal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines }),
      });
      if (res.ok) toast.success("متن‌های ترمینال ذخیره شد");
      else toast.error("خطا در ذخیره");
    } catch {
      toast.error("خطا در ارتباط");
    } finally {
      setBusy(false);
    }
  };

  const addLine = () => setLines((prev) => [...prev, ""]);
  const removeLine = (i: number) => setLines((prev) => prev.filter((_, idx) => idx !== i));
  const updateLine = (i: number, val: string) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? val : l)));

  if (loading) return null;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-8" dir="rtl">
      <PageHeader colorVar="--admin" title="ترمینال هیرو" description="متن‌هایی که در ترمینال صفحه اصلی نمایش داده می‌شوند را اینجا ویرایش کنید.">
        <div className="flex gap-2">
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <Card dir="rtl">
          <CardHeader>
            <CardTitle>خطوط ترمینال</CardTitle>
            <CardDescription>هر خط یک پیام جداگانه است که به ترتیب تایپ می‌شود. حداکثر ۲۰ خط.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {fetching ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {lines.map((line, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <GripVerticalIcon size={16} className="text-muted-foreground shrink-0" />
                    <Input
                      value={line}
                      onChange={(e) => updateLine(i, e.target.value)}
                      placeholder={`خط ${i + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeLine(i)}
                      className="shrink-0 text-destructive hover:text-destructive"
                    >
                      <TrashIcon size={14} />
                    </Button>
                  </div>
                ))}

                {lines.length < 20 && (
                  <Button type="button" variant="outline" size="sm" onClick={addLine} className="gap-1.5 w-full">
                    <PlusIcon size={14} />
                    افزودن خط جدید
                  </Button>
                )}

                <Button type="button" variant="primary" onClick={save} disabled={busy} className="w-full mt-2">
                  {busy ? "در حال ذخیره..." : "ذخیره تغییرات"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Live preview */}
        <div className="space-y-3">
          <p className="text-sm font-bold text-muted-foreground">پیش‌نمایش زنده</p>
          <TerminalHero lines={lines.filter(Boolean)} />
          <p className="text-xs text-muted-foreground">
            متن‌ها به ترتیب تایپ می‌شوند و بعد از پایان، دوباره از ابتدا شروع می‌شوند.
          </p>
        </div>
      </div>
    </main>
  );
}
