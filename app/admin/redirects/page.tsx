"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/effects/PageHeader";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type RedirectRow = { id: string; sourceModule: string; sourceSlug: string; targetModule: string; targetSlug: string; reason?: string };

export default function RedirectsAdminPage() {
  const [rows, setRows] = useState<RedirectRow[]>([]);
  const [form, setForm] = useState({ sourceModule: "blog", sourceSlug: "", targetModule: "blog", targetSlug: "", reason: "" });
  const [msg, setMsg] = useState("");

  const load = () => fetch("/api/admin/slug-redirects", { cache: "no-store" }).then((r) => r.json()).then((d) => Array.isArray(d) && setRows(d)).catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/admin/slug-redirects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) {
      setMsg("ذخیره شد");
      setForm({ ...form, sourceSlug: "", targetSlug: "", reason: "" });
      load();
    } else setMsg("خطا در ذخیره");
  };

  const remove = async (id: string) => {
    if (!confirm("حذف redirect؟")) return;
    await fetch(`/api/admin/slug-redirects?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <main className="min-h-dvh px-4 py-10 space-y-6" dir="rtl">
      <section className="mx-auto max-w-6xl space-y-6">
        <PageHeader colorVar="--admin" title="مدیریت Redirect اسلاگ‌ها" titleClassName="text-[var(--admin)]" description="برای جلوگیری از 404 بعد از حذف/تغییر اسلاگ‌ها">
          <div className="flex gap-2">
            <ButtonLink href="/admin" variant="ghost" size="sm">داشبورد</ButtonLink>
            <ButtonLink href="/admin/content-health" variant="ghost" size="sm">سلامت محتوا</ButtonLink>
          </div>
        </PageHeader>

        <Card className="p-4">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base">افزودن Redirect جدید</CardTitle>
          </CardHeader>
          <form onSubmit={save} className="grid gap-3 md:grid-cols-5">
            <Input placeholder="source module" value={form.sourceModule} onChange={(e) => setForm({ ...form, sourceModule: e.target.value })} />
            <Input placeholder="source slug" value={form.sourceSlug} onChange={(e) => setForm({ ...form, sourceSlug: e.target.value })} />
            <Input placeholder="target module" value={form.targetModule} onChange={(e) => setForm({ ...form, targetModule: e.target.value })} />
            <Input placeholder="target slug" value={form.targetSlug} onChange={(e) => setForm({ ...form, targetSlug: e.target.value })} />
            <Button type="submit">ذخیره</Button>
            <Input className="md:col-span-5" placeholder="reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            {msg && <div className="text-sm text-muted-foreground md:col-span-5">{msg}</div>}
          </form>
        </Card>

        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">Source → Target</TableHead>
                <TableHead className="text-right">دلیل</TableHead>
                <TableHead className="text-right">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs" dir="ltr">
                    <Badge variant="outline">/{r.sourceModule}/{r.sourceSlug}</Badge> → <Badge>/{r.targetModule}/{r.targetSlug}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.reason || "—"}</TableCell>
                  <TableCell>
                    <Button size="xs" variant="ghost" onClick={() => remove(r.id)} className="text-destructive hover:text-destructive">حذف</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!rows.length && <div className="p-4 text-center text-sm text-muted-foreground">Redirectی ثبت نشده است.</div>}
        </Card>
      </section>
    </main>
  );
}
