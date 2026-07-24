"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/effects/PageHeader";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function NewJobPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "", slug: "", type: "تمام وقت", remote: false, team: "",
    excerpt: "", description: "", positionDescription: "", benefits: "",
    active: true, order: 0,
  });
  const [requirements, setRequirements] = useState<string[]>([""]);

  const update = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const save = async () => {
    if (!form.title || !form.slug || !form.description) { setError("عنوان، نامک و توضیحات الزامی است"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          requirements: requirements.filter((r) => r.trim()),
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "خطا"); }
      router.push("/admin/jobs");
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  };

  return (
    <main className="min-h-dvh px-4 py-10" dir="rtl">
      <section className="mx-auto max-w-3xl space-y-6">
        <PageHeader colorVar="--workwithus" title="آگهی جدید" titleClassName="text-[var(--workwithus)]">
          <ButtonLink href="/admin/jobs" variant="ghost" size="sm">بازگشت</ButtonLink>
        </PageHeader>

        <Card className="p-5 space-y-5">
          {/* Basic info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>عنوان شغل *</Label><Input value={form.title} onChange={(e) => { update({ title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-").slice(0, 60) }); }} className="mt-1" /></div>
            <div><Label>نامک (slug) *</Label><Input value={form.slug} onChange={(e) => update({ slug: e.target.value })} className="mt-1 font-mono text-xs" dir="ltr" /></div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div><Label>نوع همکاری</Label><Input value={form.type} onChange={(e) => update({ type: e.target.value })} className="mt-1" placeholder="تمام وقت / نیمه وقت" /></div>
            <div><Label>تیم / واحد</Label><Input value={form.team} onChange={(e) => update({ team: e.target.value })} className="mt-1" /></div>
            <div className="flex items-end gap-2 pb-1">
              <Switch checked={form.remote} onCheckedChange={(v) => update({ remote: v })} />
              <Label>دورکاری</Label>
            </div>
          </div>
          <div><Label>خلاصه</Label><Input value={form.excerpt} onChange={(e) => update({ excerpt: e.target.value })} className="mt-1" /></div>

          <Separator />

          {/* شرح موقعیت شغلی */}
          <div>
            <Label>شرح موقعیت شغلی</Label>
            <Textarea value={form.positionDescription} onChange={(e) => update({ positionDescription: e.target.value })} className="mt-1 min-h-[100px]" placeholder="توضیح کامل درباره موقعیت شغلی..." />
          </div>

          {/* توضیحات */}
          <div>
            <Label>توضیحات *</Label>
            <Textarea value={form.description} onChange={(e) => update({ description: e.target.value })} className="mt-1 min-h-[150px]" placeholder="متن اصلی آگهی..." />
          </div>

          <Separator />

          {/* پیش‌نیازها (add one by one) */}
          <div>
            <Label>پیش‌نیازها</Label>
            <div className="space-y-2 mt-2">
              {requirements.map((req, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={req}
                    onChange={(e) => { const next = [...requirements]; next[i] = e.target.value; setRequirements(next); }}
                    placeholder={`پیش‌نیاز ${i + 1}`}
                    className="flex-1"
                  />
                  {requirements.length > 1 && (
                    <Button variant="ghost" size="xs" onClick={() => setRequirements(requirements.filter((_, j) => j !== i))} className="text-destructive">×</Button>
                  )}
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => setRequirements([...requirements, ""])}>+ افزودن پیش‌نیاز</Button>
            </div>
          </div>

          {/* مزایا و امکانات */}
          <div>
            <Label>مزایا و امکانات</Label>
            <Textarea value={form.benefits} onChange={(e) => update({ benefits: e.target.value })} className="mt-1 min-h-[100px]" placeholder="بیمه، محیط کاری، امکانات رفاهی..." />
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <Switch checked={form.active} onCheckedChange={(v) => update({ active: v })} />
            <Label>فعال</Label>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <ButtonLink href="/admin/jobs" variant="ghost">انصراف</ButtonLink>
            <Button onClick={save} loading={saving}>ایجاد آگهی</Button>
          </div>
        </Card>
      </section>
    </main>
  );
}
