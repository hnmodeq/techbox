"use client";

import { useEffect, useState, useCallback } from "react";
import PageHeader from "@/components/effects/PageHeader";
import { Button, ButtonLink } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { XIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

type Holiday = {
  id: string;
  jalaliDate: string;
  title: string;
  isHoliday: boolean;
  recurring: boolean;
};

const SEED_HOLIDAYS: Holiday[] = [
  { id: "h1", jalaliDate: "1404/01/01", title: "نوروز", isHoliday: true, recurring: true },
  { id: "h2", jalaliDate: "1404/01/02", title: "عید نوروز", isHoliday: true, recurring: true },
  { id: "h3", jalaliDate: "1404/01/03", title: "عید نوروز", isHoliday: true, recurring: true },
  { id: "h4", jalaliDate: "1404/01/04", title: "عید نوروز", isHoliday: true, recurring: true },
  { id: "h5", jalaliDate: "1404/01/12", title: "روز جمهوری اسلامی", isHoliday: true, recurring: true },
  { id: "h6", jalaliDate: "1404/01/13", title: "سیزده‌بدر", isHoliday: true, recurring: true },
  { id: "h7", jalaliDate: "1404/03/14", title: "رحلت امام خمینی", isHoliday: true, recurring: true },
  { id: "h8", jalaliDate: "1404/03/15", title: "قیام ۱۵ خرداد", isHoliday: true, recurring: true },
  { id: "h9", jalaliDate: "1404/11/22", title: "پیروزی انقلاب اسلامی", isHoliday: true, recurring: true },
  { id: "h10", jalaliDate: "1404/12/29", title: "ملی شدن صنعت نفت", isHoliday: true, recurring: true },
];

export default function AdminHolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New holiday form
  const [newDate, setNewDate] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newRecurring, setNewRecurring] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/holidays", { cache: "no-store" });
      const data = await res.json();
      setHolidays(data.holidays || []);
      setEnabled(data.enabled !== false);
    } catch {
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/holidays", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holidays }),
      });
      if (!res.ok) throw new Error("save_failed");
      toast.success("تعطیلات ذخیره شد ✓");
    } catch {
      toast.error("خطا در ذخیره تعطیلات");
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (val: boolean) => {
    setEnabled(val);
    try {
      await fetch("/api/admin/holidays", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: val }),
      });
      toast.success(val ? "تقویم تعطیلات فعال شد" : "تقویم تعطیلات غیرفعال شد");
    } catch {
      toast.error("خطا در تغییر وضعیت");
    }
  };

  const addHoliday = () => {
    if (!newDate || !newTitle) return;
    if (!/^\d{4}\/\d{2}\/\d{2}$/.test(newDate)) {
      toast.error("فرمت تاریخ: 1404/04/31");
      return;
    }
    const newH: Holiday = {
      id: `h_${Date.now()}`,
      jalaliDate: newDate,
      title: newTitle,
      isHoliday: true,
      recurring: newRecurring,
    };
    setHolidays((prev) => [...prev, newH]);
    setNewDate("");
    setNewTitle("");
  };

  const removeHoliday = (id: string) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
  };

  const updateHoliday = (id: string, patch: Partial<Holiday>) => {
    setHolidays((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  };

  const seedDefaults = () => {
    setHolidays(SEED_HOLIDAYS);
    toast.success("تعطیلات رسمی ایران اضافه شد");
  };

  const holidayCount = holidays.filter((h) => h.isHoliday).length;
  const recurringCount = holidays.filter((h) => h.recurring).length;

  return (
    <main className="min-h-dvh px-4 py-10 space-y-6" dir="rtl">
      <section className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          colorVar="--admin"
          title="تقویم تعطیلات"
          titleClassName="text-[var(--admin)]"
          description="مدیریت روزهای تعطیل تقویم شمسی. جمعه‌ها به‌صورت خودکار تعطیل نشان داده می‌شوند."
        >
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/admin" variant="ghost" size="sm">داشبورد</ButtonLink>
          </div>
        </PageHeader>

        {/* Stats + toggle */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">روز تعطیل</div>
            <div className="text-2xl font-bold">{holidayCount}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">تکرارشونده (هر سال)</div>
            <div className="text-2xl font-bold">{recurringCount}</div>
          </Card>
          <Card className="p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">نمایش در تقویم</div>
              <div className="text-2xl font-bold">{enabled ? "فعال" : "غیرفعال"}</div>
            </div>
            <Switch checked={enabled} onCheckedChange={toggleEnabled} />
          </Card>
        </div>

        {/* Add new holiday */}
        <Card className="p-5 space-y-4">
          <CardHeader className="p-0">
            <CardTitle>افزودن تعطیلی</CardTitle>
            <CardDescription>
              تاریخ شمسی و عنوان تعطیلی را وارد کنید. تعطیلی‌های تکرارشونده هر سال در همان روز تکرار می‌شوند.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4 space-y-3">
            <div className="flex flex-wrap gap-2 items-end">
              <div className="space-y-1 flex-1 min-w-[140px]">
                <Label className="text-xs">تاریخ شمسی (مثلاً 1404/04/31)</Label>
                <Input
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  placeholder="1404/01/01"
                  className="h-9"
                />
              </div>
              <div className="space-y-1 flex-[2] min-w-[200px]">
                <Label className="text-xs">عنوان</Label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="نوروز"
                  className="h-9"
                  onKeyDown={(e) => { if (e.key === "Enter") addHoliday(); }}
                />
              </div>
              <div className="flex items-center gap-2 pb-0.5">
                <Label className="text-xs text-muted-foreground">تکرارشونده</Label>
                <Switch checked={newRecurring} onCheckedChange={setNewRecurring} />
              </div>
              <Button type="button" size="sm" onClick={addHoliday} disabled={!newDate || !newTitle}>
                <PlusIcon className="size-4" />
                افزودن
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Holiday list */}
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">لیست تعطیلی‌ها</CardTitle>
            {holidays.length === 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={seedDefaults}>
                افزودن تعطیلات رسمی ایران
              </Button>
            )}
          </div>
          {holidays.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              هنوز تعطیلی ثبت نشده. از دکمه بالا تعطیلات رسمی را اضافه کنید یا دستی وارد کنید.
            </p>
          ) : (
            <div className="space-y-1">
              {holidays
                .sort((a, b) => a.jalaliDate.localeCompare(b.jalaliDate))
                .map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3 bg-card"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono bg-muted px-2 py-1 rounded shrink-0">
                        {h.jalaliDate}
                      </span>
                      <span className="text-sm truncate">{h.title}</span>
                      {h.recurring && <Badge variant="secondary" className="text-[10px] shrink-0">تکرارشونده</Badge>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch
                        checked={h.isHoliday}
                        onCheckedChange={(checked) => updateHoliday(h.id, { isHoliday: checked })}
                      />
                      <Button type="button" variant="ghost" size="xs" onClick={() => removeHoliday(h.id)}>
                        <XIcon className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={load} disabled={loading || saving}>
            انصراف
          </Button>
          <Button type="button" onClick={save} disabled={loading || saving} loading={saving}>
            {saving ? "در حال ذخیره..." : "ذخیره تعطیلات"}
          </Button>
        </div>
      </section>
    </main>
  );
}
