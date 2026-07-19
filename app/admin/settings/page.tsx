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
import { toast } from "sonner";

type Settings = {
  "comments.mode": string;
  "comments.hidden_globally": string;
  "jobs.resume_retention_days": string;
  "auth.require_email_verification": string;
  "email.provider": string;
  "email.nodemailer_host": string;
  "email.nodemailer_port": string;
  "email.nodemailer_secure": string;
  "email.nodemailer_user": string;
  "email.nodemailer_pass": string;
  "email.from_address": string;
};

const DEFAULTS: Settings = {
  "comments.mode": "auto_approve",
  "comments.hidden_globally": "false",
  "jobs.resume_retention_days": "30",
  "auth.require_email_verification": "false",
  "email.provider": "resend",
  "email.nodemailer_host": "smtp.gmail.com",
  "email.nodemailer_port": "465",
  "email.nodemailer_secure": "true",
  "email.nodemailer_user": "",
  "email.nodemailer_pass": "",
  "email.from_address": "TechBox <techboxnoreply@gmail.com>",
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
      toast.success("تنظیمات با موفقیت ذخیره شد.");
      await load();
    } catch (error: any) {
      toast.error(error?.message || "خطا در ذخیره تنظیمات");
    } finally {
      setSaving(false);
    }
  };

  const commentsHidden = settings["comments.hidden_globally"] === "true";

  return (
    <main className="min-h-dvh px-4 py-10 space-y-6" dir="rtl">
      <section className="mx-auto max-w-4xl space-y-6">
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

        <Card className="p-6 border shadow-sm space-y-6">
          <CardHeader className="p-0">
            <CardTitle>تنظیمات ایمیل و ثبت‌نام</CardTitle>
            <CardDescription>مدیریت سیستم ارسال ایمیل و نیازمندی‌های تأیید حساب کاربری.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="space-y-0.5">
                <Label>الزام تأیید ایمیل برای ورود (تأیید حساب)</Label>
                <div className="text-sm text-muted-foreground">اگر غیرفعال باشد، کاربران بلافاصله پس از ثبت‌نام وارد سیستم می‌شوند.</div>
              </div>
              <Switch
                checked={settings["auth.require_email_verification"] === "true"}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, "auth.require_email_verification": checked ? "true" : "false" }))}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>سرویس ارسال ایمیل</Label>
                <Select
                  value={settings["email.provider"]}
                  onValueChange={(val) => setSettings((prev) => ({ ...prev, "email.provider": String(val) }))}
                >
                  <SelectTrigger dir="rtl">
                    <SelectValue placeholder="انتخاب سرویس..." />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="resend">سرویس ابری Resend (نیاز به دامنه اختصاصی)</SelectItem>
                    <SelectItem value="nodemailer">سرویس Nodemailer (مناسب برای Gmail، Yahoo و...)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>آدرس فرستنده (From)</Label>
                <Input
                  dir="ltr"
                  placeholder="TechBox <info@techbox.ir>"
                  value={settings["email.from_address"]}
                  onChange={(event) => setSettings((prev) => ({ ...prev, "email.from_address": event.target.value }))}
                />
              </div>

              {settings["email.provider"] === "nodemailer" && (
                <div className="grid gap-4 sm:grid-cols-2 bg-muted/50 p-4 rounded-lg border border-border">
                  <div className="space-y-2">
                    <Label>سرور (Host)</Label>
                    <Input
                      dir="ltr"
                      placeholder="smtp.gmail.com"
                      value={settings["email.nodemailer_host"]}
                      onChange={(event) => setSettings((prev) => ({ ...prev, "email.nodemailer_host": event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>پورت (Port)</Label>
                    <Input
                      dir="ltr"
                      placeholder="465"
                      type="number"
                      value={settings["email.nodemailer_port"]}
                      onChange={(event) => setSettings((prev) => ({ ...prev, "email.nodemailer_port": event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>نام کاربری (ایمیل شما)</Label>
                    <Input
                      dir="ltr"
                      placeholder="techboxnoreply@gmail.com"
                      value={settings["email.nodemailer_user"]}
                      onChange={(event) => setSettings((prev) => ({ ...prev, "email.nodemailer_user": event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رمز عبور (App Password برای Gmail)</Label>
                    <Input
                      dir="ltr"
                      placeholder="16-character app password"
                      value={settings["email.nodemailer_pass"]}
                      onChange={(event) => setSettings((prev) => ({ ...prev, "email.nodemailer_pass": event.target.value }))}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
