"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/components/effects/PageHeader";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "", slug: "", type: "تمام وقت", remote: false, team: "",
    excerpt: "", description: "", positionDescription: "", benefits: "",
    active: true, order: 0, salaryMin: 0, salaryMax: 0,
  });
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [faq, setFaq] = useState<Array<{ question: string; answer: string }>>([]);

  const update = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  useEffect(() => {
    fetch(`/api/admin/jobs`, { cache: "no-store" })
      .then((r) => r.json())
      .then((jobs: any[]) => {
        const job = jobs.find((j) => j.id === id);
        if (job) {
          setForm({
            title: job.title || "", slug: job.slug || "", type: job.type || "تمام وقت",
            remote: job.remote || false, team: job.team || "", excerpt: job.excerpt || "",
            description: job.description || "", positionDescription: job.positionDescription || "",
            benefits: job.benefits || "", active: job.active ?? true, order: job.order || 0,
            salaryMin: job.salaryMin || 0, salaryMax: job.salaryMax || 0,
          });
          setRequirements(Array.isArray(job.requirements) && job.requirements.length > 0 ? job.requirements : [""]);
          setFaq(Array.isArray(job.faq) ? job.faq : []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const save = async () => {
    if (!form.title || !form.slug || !form.description) { setError("عنوان، نامک و توضیحات الزامی است"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
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

  if (loading) return <main className="min-h-dvh px-4 py-10" dir="rtl"><p className="text-muted-foreground">در حال بارگذاری...</p></main>;

  return (
    <main className="min-h-dvh px-4 py-10" dir="rtl">
      <section className="mx-auto max-w-3xl space-y-6">
        <PageHeader colorVar="--workwithus" title={`ویرایش: ${form.title}`} titleClassName="text-[var(--workwithus)]">
          <ButtonLink href="/admin/jobs" variant="ghost" size="sm">بازگشت</ButtonLink>
        </PageHeader>

        <Card className="p-5 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>عنوان شغل *</Label><Input value={form.title} onChange={(e) => update({ title: e.target.value })} className="mt-1" /></div>
            <div><Label>نامک (slug) *</Label><Input value={form.slug} onChange={(e) => update({ slug: e.target.value })} className="mt-1 font-mono text-xs" dir="ltr" /></div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div><Label>نوع همکاری</Label><Input value={form.type} onChange={(e) => update({ type: e.target.value })} className="mt-1" /></div>
            <div><Label>تیم / واحد</Label><Input value={form.team} onChange={(e) => update({ team: e.target.value })} className="mt-1" /></div>
            <div className="flex items-end gap-2 pb-1">
              <Switch checked={form.remote} onCheckedChange={(v) => update({ remote: v })} />
              <Label>دورکاری</Label>
            </div>
          </div>
          <div><Label>خلاصه</Label><Input value={form.excerpt} onChange={(e) => update({ excerpt: e.target.value })} className="mt-1" /></div>

          <Separator />

          <div>
            <Label>شرح موقعیت شغلی</Label>
            <Textarea value={form.positionDescription} onChange={(e) => update({ positionDescription: e.target.value })} className="mt-1 min-h-[100px]" />
          </div>
          <div>
            <Label>توضیحات *</Label>
            <Textarea value={form.description} onChange={(e) => update({ description: e.target.value })} className="mt-1 min-h-[150px]" />
          </div>

          <Separator />

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

          <div>
            <Label>مزایا و امکانات</Label>
            <Textarea value={form.benefits} onChange={(e) => update({ benefits: e.target.value })} className="mt-1 min-h-[100px]" />
          </div>

          <Separator />

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>حداقل حقوق (تومان)</Label>
              <Input type="number" value={form.salaryMin || ""} onChange={(e) => update({ salaryMin: parseInt(e.target.value) || 0 })} className="mt-1" placeholder="0" dir="ltr" />
            </div>
            <div>
              <Label>حداکثر حقوق (تومان)</Label>
              <Input type="number" value={form.salaryMax || ""} onChange={(e) => update({ salaryMax: parseInt(e.target.value) || 0 })} className="mt-1" placeholder="0" dir="ltr" />
            </div>
          </div>

          <Separator />

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
            <Button onClick={save} loading={saving}>ذخیره تغییرات</Button>
          </div>
        </Card>
      </section>
    </main>
  );
}
