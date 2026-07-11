"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/effects/PageHeader";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    <main className="min-h-dvh px-4 py-10" dir="rtl">
      <section className="mx-auto max-w-4xl space-y-6">
        <PageHeader colorVar="--admin" title="تنظیمات سایت" titleClassName="text-[var(--admin)]" description="سیاست دیدگاه‌ها و نگهداری رزومه‌ها">
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/admin" variant="ghost" size="sm">داشبورد</ButtonLink>
            <Button type="button" variant="ghost" size="sm" onClick={load} disabled={loading}>به‌روزرسانی</Button>
          </div>
        </PageHeader>

        <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-size)] space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold">دیدگاه‌ها</h2>
              <p className="paragraph-color text-[length:var(--paragraph-font-size)]">کنترل تأیید دیدگاه‌ها و مخفی‌سازی سراسری.</p>
            </div>
            <Badge variant={commentsHidden ? "danger" : "success"}>{commentsHidden ? "مخفی سراسری" : "فعال"}</Badge>
          </div>

          <label className="block space-y-2">
            <span className="text-[length:var(--paragraph-font-size)] font-semibold text-[var(--primary-text)]">سیاست ثبت دیدگاه</span>
            <select
              className="input"
              value={settings["comments.mode"]}
              onChange={(event) => setSettings((prev) => ({ ...prev, "comments.mode": event.target.value }))}
            >
              <option value="auto_approve">تأیید خودکار</option>
              <option value="require_approval">نیازمند تأیید مدیر</option>
            </select>
          </label>

          <label className="flex items-start gap-3 rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] p-3">
            <input
              type="checkbox"
              checked={commentsHidden}
              onChange={(event) => setSettings((prev) => ({ ...prev, "comments.hidden_globally": event.target.checked ? "true" : "false" }))}
              className="mt-1"
            />
            <span>
              <span className="block font-semibold text-[var(--primary-text)]">مخفی‌سازی همه دیدگاه‌ها</span>
              <span className="paragraph-color text-[length:var(--paragraph-font-size)]">وقتی فعال باشد، دیدگاه‌ها در سایت نمایش داده نمی‌شوند و ارسال دیدگاه جدید متوقف می‌شود.</span>
            </span>
          </label>
        </div>

        <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-size)] space-y-4">
          <div>
            <h2 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold">رزومه‌ها</h2>
            <p className="paragraph-color text-[length:var(--paragraph-font-size)]">رزومه‌های قدیمی هنگام مشاهده لیست درخواست‌های شغلی پاک‌سازی می‌شوند.</p>
          </div>
          <label className="block space-y-2">
            <span className="text-[length:var(--paragraph-font-size)] font-semibold text-[var(--primary-text)]">مدت نگهداری رزومه‌ها (روز)</span>
            <input
              className="input"
              type="number"
              min={1}
              max={365}
              value={settings["jobs.resume_retention_days"]}
              onChange={(event) => setSettings((prev) => ({ ...prev, "jobs.resume_retention_days": event.target.value }))}
            />
          </label>
        </div>

        {message && (
          <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-3 text-[length:var(--paragraph-font-size)] paragraph-color">
            {message}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={load} disabled={loading || saving}>انصراف</Button>
          <Button type="button" onClick={save} disabled={loading || saving}>{saving ? "در حال ذخیره..." : "ذخیره تنظیمات"}</Button>
        </div>
      </section>
    </main>
  );
}
