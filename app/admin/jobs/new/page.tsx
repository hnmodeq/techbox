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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const BENEFIT_OPTIONS = [
  "پاداش", "بیمه تامین اجتماعی", "بیمه تکمیلی", "اضافه کار",
  "سرویس رفت و آمد", "ناهار", "صباحه", "عصرانه", "محیط استراحت", "پرداختی به موقع",
];

export default function NewJobPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "", slug: "", type: "تمام وقت", remote: false, team: "",
    excerpt: "", description: "", positionDescription: "", benefits: "",
    active: true, order: 0, salaryMin: 0, salaryMax: 0,
  });
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [faq, setFaq] = useState<Array<{ question: string; answer: string }>>([]);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);

  const update = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const toggleBenefit = (b: string) => {
    setSelectedBenefits((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]);
  };

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
          benefits: selectedBenefits.join("\n"),
          salaryMin: form.salaryMin || undefined,
          salaryMax: form.salaryMax || undefined,
          requirements: requirements.filter((r) => r.trim()),
          faq: faq.filter((f) => f.question.trim() && f.answer.trim()),
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
            <div>
              <Label>نوع همکاری</Label>
              <Select value={form.type} onValueChange={(v) => update({ type: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="تمام وقت">تمام وقت</SelectItem>
                  <SelectItem value="نیمه وقت">نیمه وقت</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>محل کار</Label>
              <Select value={form.remote ? "true" : "false"} onValueChange={(v) => update({ remote: v === "true" })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">حضوری</SelectItem>
                  <SelectItem value="true">دورکاری</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>تیم / واحد</Label><Input value={form.team} onChange={(e) => update({ team: e.target.value })} className="mt-1" /></div>
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

          {/* پیش‌نیازها */}
          <div>
            <Label>پیش‌نیازها</Label>
            <div className="space-y-2 mt-2">
              {requirements.map((req, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={req} onChange={(e) => { const next = [...requirements]; next[i] = e.target.value; setRequirements(next); }} placeholder={`پیش‌نیاز ${i + 1}`} className="flex-1" />
                  {requirements.length > 1 && <Button variant="ghost" size="xs" onClick={() => setRequirements(requirements.filter((_, j) => j !== i))} className="text-destructive">×</Button>}
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => setRequirements([...requirements, ""])}>+ افزودن پیش‌نیاز</Button>
            </div>
          </div>

          <Separator />

          {/* مزایا و امکانات — checkboxes */}
          <div>
            <Label>مزایا و امکانات</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              {BENEFIT_OPTIONS.map((b) => (
                <label key={b} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={selectedBenefits.includes(b)} onCheckedChange={() => toggleBenefit(b)} />
                  <span className="text-sm">{b}</span>
                </label>
              ))}
            </div>
          </div>

          <Separator />

          {/* محدوده حقوق — slider */}
          <div>
            <Label>محدوده حقوق (تومان)</Label>
            <div className="grid sm:grid-cols-2 gap-6 mt-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">حداقل</span>
                  <span className="text-xs font-bold">{form.salaryMin.toLocaleString("fa-IR")}</span>
                </div>
                <input type="range" min={0} max={100000000} step={1000000} value={form.salaryMin} onChange={(e) => update({ salaryMin: parseInt(e.target.value) })} className="w-full" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">حداکثر</span>
                  <span className="text-xs font-bold">{form.salaryMax.toLocaleString("fa-IR")}</span>
                </div>
                <input type="range" min={0} max={100000000} step={1000000} value={form.salaryMax} onChange={(e) => update({ salaryMax: parseInt(e.target.value) })} className="w-full" />
              </div>
            </div>
          </div>

          <Separator />

          {/* سوالات متداول */}
          <div>
            <Label>سوالات متداول</Label>
            <div className="space-y-3 mt-2">
              {faq.map((item, i) => (
                <div key={i} className="border border-border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">سوال {i + 1}</span>
                    <button onClick={() => setFaq(faq.filter((_, j) => j !== i))} className="text-destructive text-xs cursor-pointer">×</button>
                  </div>
                  <Input value={item.question} onChange={(e) => { const next = [...faq]; next[i] = { ...next[i], question: e.target.value }; setFaq(next); }} placeholder="سوال" />
                  <Textarea value={item.answer} onChange={(e) => { const next = [...faq]; next[i] = { ...next[i], answer: e.target.value }; setFaq(next); }} placeholder="پاسخ" className="min-h-[60px]" />
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => setFaq([...faq, { question: "", answer: "" }])}>+ افزودن سوال</Button>
            </div>
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
