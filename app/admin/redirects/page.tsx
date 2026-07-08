"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/effects/PageHeader";
import { Button, ButtonLink } from "@/components/ui/button";

type RedirectRow = { id: string; sourceModule: string; sourceSlug: string; targetModule: string; targetSlug: string; reason?: string };

export default function RedirectsAdminPage() {
  const [rows, setRows] = useState<RedirectRow[]>([]);
  const [form, setForm] = useState({ sourceModule: "blog", sourceSlug: "", targetModule: "blog", targetSlug: "", reason: "" });
  const [msg, setMsg] = useState("");

  const load = () => fetch("/api/admin/slug-redirects", { cache: "no-store" }).then(r=>r.json()).then(d=>Array.isArray(d)&&setRows(d)).catch(()=>{});
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/admin/slug-redirects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setMsg("ذخیره شد"); setForm({ ...form, sourceSlug: "", targetSlug: "", reason: "" }); load(); }
    else setMsg("خطا در ذخیره");
  };

  const remove = async (id: string) => {
    if (!confirm("حذف redirect؟")) return;
    await fetch(`/api/admin/slug-redirects?id=${id}`, { method: "DELETE" });
    load();
  };

  return <main className="min-h-dvh px-4 py-10" dir="rtl"><section className="mx-auto max-w-6xl space-y-6"><PageHeader colorVar="--admin" title="مدیریت Redirect اسلاگ‌ها" titleClassName="text-[var(--admin)]" description="برای جلوگیری از 404 بعد از حذف/تغییر اسلاگ‌ها"><div className="flex gap-2"><ButtonLink href="/admin" variant="ghost" size="sm">داشبورد</ButtonLink><ButtonLink href="/admin/content-health" variant="ghost" size="sm">سلامت محتوا</ButtonLink></div></PageHeader><form onSubmit={save} className="grid gap-3 rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-4 md:grid-cols-5"><input className="input" placeholder="source module" value={form.sourceModule} onChange={e=>setForm({...form,sourceModule:e.target.value})}/><input className="input" placeholder="source slug" value={form.sourceSlug} onChange={e=>setForm({...form,sourceSlug:e.target.value})}/><input className="input" placeholder="target module" value={form.targetModule} onChange={e=>setForm({...form,targetModule:e.target.value})}/><input className="input" placeholder="target slug" value={form.targetSlug} onChange={e=>setForm({...form,targetSlug:e.target.value})}/><Button>ذخیره</Button><input className="input md:col-span-5" placeholder="reason" value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})}/>{msg&&<div className="paragraph-color md:col-span-5">{msg}</div>}</form><div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] overflow-hidden">{rows.map(r=><div key={r.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-color)]/30 p-4"><div className="font-mono text-sm" dir="ltr">/{r.sourceModule}/{r.sourceSlug} → /{r.targetModule}/{r.targetSlug}</div><Button size="xs" variant="ghost" onClick={()=>remove(r.id)}>حذف</Button></div>)}{!rows.length&&<div className="p-4 paragraph-color">Redirectی ثبت نشده است.</div>}</div></section></main>;
}
