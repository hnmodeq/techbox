"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/effects/PageHeader";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

type Settings = {
  "comments.mode": string;
  "comments.hidden_globally": string;
  "jobs.resume_retention_days": string;
};

const DEFAULTS: Settings = {
  "comments.mode": "auto_approve",
  "comments.hidden_globally": "false",
  "jobs.resume_retention_days": "30",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/settings", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "settings_load_failed");
      setSettings({ ...DEFAULTS, ...data });
    } catch (error: any) {
      setMessage(error?.message || "خطا در دریافت تنظیمات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "settings_save_failed");
      setMessage("تنظیمات ذخیره شد.");
      await load();
    } catch (error: any) {
      setMessage(error?.message || "خطا در ذخیره تنظیمات");
    } finally {
      setSaving(false);
    }
  };

  const commentsHidden = settings["comments.hidden_globally"] === "true";

  return (
    <main className="min-h-dvh px-4 py-10 space-y-6" dir="rtl">
      <section className="mx-auto max-w-4xl space-y-6">
        <PageBreadcrumb />
        <PageHeader colorVar="--admin" title="تنظیمات سایت" titleClassName="text-[var(--admin)]" description="سیاست دیدگاه‌ها و نگهداری رزومه‌ها">
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/admin" variant="ghost" size="sm">داشبورد</ButtonLink>
            <Button type="button" variant="ghost" size="sm" onClick={load} disabled={loading}>به‌روزرسانی</Button>
          </div>
        </PageHeader>

        <Card className="p-5 space-y-5">
          <CardHeader className="p-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle>دیدگاه‌ها</CardTitle>
              <CardDescription>کنترل تأیید دیدگاه‌ها و مخفی‌سازی سراسری.</CardDescription>
            </div>
            <Badge variant={commentsHidden ? "destructive" : "default"}>{commentsHidden ? "مخفی سراسری" : "فعال"}</Badge>
          </CardHeader>
          <CardContent className="p-0 space-y-4 pt-4">
            <div className="space-y-2">
              <Label>سیاست ثبت دیدگاه</Label>
              <Select value={settings["comments.mode"]} onValueChange={(v) => setSettings((prev) => ({ ...prev, "comments.mode": v as string }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto_approve">تأیید خودکار</SelectItem>
                  <SelectItem value="require_approval">نیازمند تأیید مدیر</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="p-3 bg-muted/20">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <Label>مخفی‌سازی همه دیدگاه‌ها</Label>
                  <p className="text-xs text-muted-foreground">وقتی فعال باشد، دیدگاه‌ها در سایت نمایش داده نمی‌شوند و ارسال دیدگاه جدید متوقف می‌شود.</p>
                </div>
                <Switch
                  checked={commentsHidden}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, "comments.hidden_globally": checked ? "true" : "false" }))}
                />
              </div>
            </Card>
          </CardContent>
        </Card>

        <Card className="p-5 space-y-4">
          <CardHeader className="p-0">
            <CardTitle>رزومه‌ها</CardTitle>
            <CardDescription>رزومه‌های قدیمی هنگام مشاهده لیست درخواست‌های شغلی پاک‌سازی می‌شوند.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2">
              <Label>مدت نگهداری رزومه‌ها (روز)</Label>
              <Input
                type="number"
                min={1}
                max={365}
                value={settings["jobs.resume_retention_days"]}
                onChange={(event) => setSettings((prev) => ({ ...prev, "jobs.resume_retention_days": event.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {message && <Card className="p-3 text-sm text-muted-foreground">{message}</Card>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={load} disabled={loading || saving}>انصراف</Button>
          <Button type="button" onClick={save} disabled={loading || saving} loading={saving}>
            {saving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
          </Button>
        </div>
      </section>
    </main>
  );
}
