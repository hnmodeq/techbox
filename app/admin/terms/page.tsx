"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/effects/PageHeader";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminTermsPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (d["terms.content"]) setContent(d["terms.content"]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "terms.content": content }),
      });
      setMessage(res.ok ? "ذخیره شد ✓" : "خطا");
    } catch { setMessage("خطا"); }
    setSaving(false);
  };

  if (loading) return <main className="min-h-dvh px-4 py-10" dir="rtl"><p className="text-muted-foreground">در حال بارگذاری...</p></main>;

  return (
    <main className="min-h-dvh px-4 py-10" dir="rtl">
      <section className="mx-auto max-w-3xl space-y-6">
        <PageHeader colorVar="--workwithus" title="شرایط همکاری" titleClassName="text-[var(--workwithus)]" description="محتوای صفحه /terms">
          <ButtonLink href="/admin" variant="ghost" size="sm">داشبورد</ButtonLink>
          <ButtonLink href="/terms" variant="ghost" size="sm">پیش‌نمایش</ButtonLink>
        </PageHeader>

        <Card className="p-5 space-y-4">
          <div>
            <Label>متن شرایط همکاری (HTML مجاز)</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px] mt-1 font-mono text-sm"
              dir="ltr"
              placeholder="<h2>شرایط عمومی</h2><p>...</p>"
            />
          </div>
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
          <Button onClick={save} loading={saving}>ذخیره</Button>
        </Card>
      </section>
    </main>
  );
}
