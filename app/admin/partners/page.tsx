"use client";

/**
 * Admin · Homepage partners.
 *
 * Full CRUD for the companies shown in the homepage partners band.
 * Nothing about that section is hardcoded — if this list is empty the
 * section hides itself.
 */
import { useCallback, useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/layout/admin-guard";
import PageHeader from "@/components/effects/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { StorageUploadField } from "@/components/admin/StorageUploadField";
import { toast } from "sonner";

type Partner = {
  id: string;
  name: string;
  logo: string | null;
  url: string | null;
  tagline: string | null;
  order: number;
  published: boolean;
};

const BLANK = { name: "", logo: "", url: "", tagline: "", order: 0, published: true };

export default function PartnersAdminPage() {
  const [items, setItems] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...BLANK });

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/partners", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setItems)
      .catch(() => toast.error("بارگذاری شرکا ناموفق بود"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const reset = () => {
    setEditing(null);
    setForm({ ...BLANK });
  };

  async function save() {
    if (!form.name.trim()) {
      toast.error("نام شرکت الزامی است");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/partners", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { id: editing, ...form } : form),
      });
      if (!res.ok) throw new Error();
      toast.success(editing ? "به‌روزرسانی شد" : "افزوده شد");
      reset();
      load();
    } catch {
      toast.error("ذخیره ناموفق بود");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`حذف «${name}»؟`)) return;
    try {
      const res = await fetch(`/api/admin/partners?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("حذف شد");
      load();
    } catch {
      toast.error("حذف ناموفق بود");
    }
  }

  function edit(p: Partner) {
    setEditing(p.id);
    setForm({
      name: p.name,
      logo: p.logo ?? "",
      url: p.url ?? "",
      tagline: p.tagline ?? "",
      order: p.order,
      published: p.published,
    });
  }

  return (
    <AdminGuard>
      {() => (
        <div dir="rtl" className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
          <PageHeader
            title="شرکای تکباکس"
            description="شرکت‌هایی که در صفحه اصلی نمایش داده می‌شوند. اگر فهرست خالی باشد، این بخش نمایش داده نمی‌شود."
          />

          <Card>
            <CardContent className="space-y-4 p-5">
              <h2 className="text-base font-bold">
                {editing ? "ویرایش شریک" : "افزودن شریک جدید"}
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="p-name" className="mb-1.5 block">نام شرکت *</Label>
                  <Input id="p-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="QNAP" />
                </div>
                <div>
                  <Label htmlFor="p-tag" className="mb-1.5 block">توضیح کوتاه</Label>
                  <Input id="p-tag" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="شریک ذخیره‌سازی" />
                </div>
                <div>
                  <Label htmlFor="p-url" className="mb-1.5 block">آدرس وب‌سایت</Label>
                  <Input id="p-url" dir="ltr" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://qnap.com" />
                </div>
                <div>
                  <Label htmlFor="p-order" className="mb-1.5 block">ترتیب نمایش</Label>
                  <Input id="p-order" type="number" min={0} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="mb-1.5 block">لوگو</Label>
                <StorageUploadField
                  label="آپلود لوگو"
                  kind="image"
                  folder="partner-logos"
                  accept="image/*"
                  onUploaded={(r) => setForm((f) => ({ ...f, logo: r.url }))}
                />
                <Input dir="ltr" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="یا نشانی مستقیم لوگو" />
                {form.logo && (
                  <div className="flex items-center gap-3 rounded-md border border-border p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.logo} alt="" className="h-10 max-w-[120px] object-contain" />
                    <Button type="button" variant="ghost" size="xs" onClick={() => setForm({ ...form, logo: "" })}>حذف</Button>
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground">
                  بدون لوگو، نام شرکت به‌صورت متنی نمایش داده می‌شود.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">نمایش در صفحه اصلی</span>
                <Switch checked={form.published} onCheckedChange={(v: boolean) => setForm({ ...form, published: v })} />
              </div>

              <div className="flex gap-3">
                <Button onClick={save} disabled={saving}>
                  {saving ? "در حال ذخیره…" : editing ? "به‌روزرسانی" : "افزودن"}
                </Button>
                {editing && <Button variant="ghost" onClick={reset}>انصراف</Button>}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h2 className="text-base font-bold">
              فهرست شرکا {items.length > 0 && `(${items.length})`}
            </h2>

            {loading ? (
              <p className="text-sm text-muted-foreground">در حال بارگذاری…</p>
            ) : items.length === 0 ? (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                هنوز شریکی اضافه نشده است. بخش «شرکا» در صفحه اصلی نمایش داده نمی‌شود.
              </p>
            ) : (
              <ul className="space-y-2">
                {items.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    {p.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.logo} alt="" className="h-10 w-20 shrink-0 object-contain" />
                    ) : (
                      <span className="grid h-10 w-20 shrink-0 place-items-center rounded bg-muted text-xs">بدون لوگو</span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{p.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {p.tagline || "—"} {p.url ? `· ${p.url}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">#{p.order}</span>
                    {!p.published && <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs">مخفی</span>}
                    <Button variant="ghost" size="sm" onClick={() => edit(p)}>ویرایش</Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(p.id, p.name)}>حذف</Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </AdminGuard>
  );
}
