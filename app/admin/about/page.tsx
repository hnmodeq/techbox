"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import PageHeader from "@/components/effects/PageHeader";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

type User = { id: string; name: string; username: string; job: string | null; roleFa: string | null; avatar: string | null; verifiedType: string | null; verifiedLabel: string | null };
type Member = { id: string; sectionId: string; name: string; role: string; avatar: string | null; order: number };
type Section = { id: string; title: string; order: number; enabled: boolean; members: Member[] };

const DEFAULT_SECTIONS = [
  "تیم مدیریت", "تیم طراحی گرافیک", "تیم محتوای چند رسانه‌ای",
  "تیم تحریریه", "کارشناسان فنی", "تیم پشتیبانی",
  "کارشناسان فروش", "تیم مارکتینگ", "خانواده تکباکس",
];

type TabId = "sections" | "description" | "contact";

// ─── User Picker ────────────────────────────────────────────────────────────

function UserPicker({ sectionId, onAdd }: { sectionId: string; onAdd: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (query.length < 1) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/admin/users/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.ok ? r.json() : [])
        .then((data) => { setResults(data); setOpen(true); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const selectUser = async (u: User) => {
    await fetch("/api/admin/about/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId, userId: u.id }),
    });
    setQuery("");
    setOpen(false);
    onAdd();
  };

  return (
    <div ref={ref} className="relative">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 1 && setOpen(true)}
        placeholder="جستجوی کاربر..."
        className="h-8 text-sm"
      />
      {open && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((u) => (
            <button
              key={u.id}
              onClick={() => selectUser(u)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent transition-colors text-right cursor-pointer"
            >
              {u.avatar ? (
                <Image src={u.avatar} alt={u.name} width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <div className="h-7 w-7 rounded-full bg-muted" />
              )}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold truncate">{u.name}</div>
                <div className="text-[10px] text-muted-foreground truncate">{u.job || u.roleFa || u.username}</div>
              </div>
              {u.verifiedType && <Badge variant="secondary" className="text-[9px] shrink-0">✓</Badge>}
            </button>
          ))}
        </div>
      )}
      {open && query.length >= 1 && results.length === 0 && !loading && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg p-3 text-xs text-muted-foreground text-center">
          کاربری یافت نشد
        </div>
      )}
    </div>
  );
}

// ─── Auto-populate verified users ───────────────────────────────────────────

function AutoPopulateButton({ sectionId, sectionTitle, onDone }: { sectionId: string; sectionTitle: string; onDone: () => void }) {
  const [loading, setLoading] = useState(false);

  const isFamily = sectionTitle.includes("خانواده");

  const populate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/search?verified=1`);
      const users: User[] = await res.json();
      let added = 0;
      for (const u of users) {
        await fetch("/api/admin/about/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sectionId, userId: u.id }),
        });
        added++;
      }
      if (added > 0) onDone();
    } catch {}
    setLoading(false);
  };

  if (!isFamily) return null;

  return (
    <Button variant="outline" size="sm" onClick={populate} loading={loading} className="text-[11px]">
      افزودن خودکار کاربران تایید شده
    </Button>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function AdminAboutPage() {
  const [tab, setTab] = useState<TabId>("sections");
  const [sections, setSections] = useState<Section[]>([]);
  const [settings, setSettings] = useState({ description: "", addressTitle: "", address: "", email: "", hours: "", mapUrl: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [secRes, setRes] = await Promise.all([
        fetch("/api/admin/about/sections", { cache: "no-store" }),
        fetch("/api/admin/about/settings", { cache: "no-store" }),
      ]);
      if (secRes.ok) setSections(await secRes.json());
      if (setRes.ok) setSettings(await setRes.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/about/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      setMessage(res.ok ? "تنظیمات ذخیره شد ✓" : "خطا در ذخیره");
    } catch { setMessage("خطا"); }
    setSaving(false);
  };

  const addSection = async (title: string) => {
    const res = await fetch("/api/admin/about/sections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, order: sections.length }) });
    if (res.ok) { const s = await res.json(); setSections((prev) => [...prev, { ...s, members: [] }]); }
  };
  const updateSection = async (id: string, patch: Partial<Section>) => {
    await fetch("/api/admin/about/sections", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...patch }) });
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };
  const deleteSection = async (id: string) => {
    if (!confirm("حذف این بخش و تمام اعضای آن؟")) return;
    await fetch("/api/admin/about/sections", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const deleteMember = async (id: string, sectionId: string) => {
    await fetch("/api/admin/about/members", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, members: s.members.filter((m) => m.id !== id) } : s)));
  };

  const moveSection = (idx: number, dir: -1 | 1) => {
    const next = [...sections];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    const reordered = next.map((s, i) => ({ ...s, order: i }));
    setSections(reordered);
    reordered.forEach((s) => updateSection(s.id, { order: s.order }));
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "sections", label: "تیم‌ها" },
    { id: "description", label: "توضیحات" },
    { id: "contact", label: "اطلاعات تماس" },
  ];

  if (loading) return <main className="min-h-dvh px-4 py-10" dir="rtl"><p className="text-muted-foreground">در حال بارگذاری...</p></main>;

  return (
    <main className="min-h-dvh px-4 py-10 space-y-6" dir="rtl">
      <section className="mx-auto max-w-4xl space-y-6">
        <PageHeader colorVar="--admin" title="مدیریت صفحه درباره ما" titleClassName="text-[var(--admin)]" description="توضیحات، تیم‌ها و اطلاعات تماس">
          <ButtonLink href="/admin" variant="ghost" size="sm">داشبورد</ButtonLink>
          <ButtonLink href="/about" variant="ghost" size="sm">پیش‌نمایش</ButtonLink>
        </PageHeader>

        <div className="flex gap-1 border-b border-border pb-0">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-px ${tab === t.id ? "border-[var(--admin)] text-[var(--admin)]" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t.label}</button>
          ))}
        </div>

        {/* Tab: Description */}
        {tab === "description" && (
          <Card className="p-5 space-y-4">
            <CardHeader className="p-0"><CardTitle>توضیحات صفحه درباره ما</CardTitle></CardHeader>
            <CardContent className="p-0 space-y-3">
              <div>
                <Label>متن توضیحات (HTML مجاز)</Label>
                <Textarea value={settings.description} onChange={(e) => setSettings((s) => ({ ...s, description: e.target.value }))} className="min-h-[200px] mt-1 font-mono text-sm" dir="ltr" />
              </div>
              <Button onClick={saveSettings} loading={saving}>ذخیره توضیحات</Button>
            </CardContent>
          </Card>
        )}

        {/* Tab: Team Sections */}
        {tab === "sections" && (
          <div className="space-y-4">
            {sections.map((section, idx) => (
              <Card key={section.id} className={`p-0 overflow-hidden ${!section.enabled ? "opacity-50" : ""}`}>
                <div className="flex items-center justify-between p-4 bg-muted/30 border-b">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => moveSection(idx, -1)} disabled={idx === 0} className="text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer">▲</button>
                      <button onClick={() => moveSection(idx, 1)} disabled={idx === sections.length - 1} className="text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer">▼</button>
                    </div>
                    <Input value={section.title} onChange={(e) => updateSection(section.id, { title: e.target.value })} className="h-8 w-52 font-bold" />
                    <Badge variant="secondary" className="text-[10px]">{section.members.length} عضو</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] text-muted-foreground">فعال</Label>
                    <Switch checked={section.enabled} onCheckedChange={(v) => updateSection(section.id, { enabled: v })} />
                    <Button variant="ghost" size="xs" onClick={() => deleteSection(section.id)} className="text-destructive">حذف</Button>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {/* Existing members */}
                  {section.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 bg-muted/20 rounded-lg px-3 py-2">
                      {member.avatar ? (
                        <Image src={member.avatar} alt={member.name} width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-muted" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold truncate block">{member.name}</span>
                        <span className="text-[10px] text-muted-foreground truncate block">{member.role || "—"}</span>
                      </div>
                      <Button variant="ghost" size="xs" onClick={() => deleteMember(member.id, section.id)} className="text-destructive shrink-0">×</Button>
                    </div>
                  ))}

                  {/* Add user by search */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1">
                      <UserPicker sectionId={section.id} onAdd={loadAll} />
                    </div>
                    <AutoPopulateButton sectionId={section.id} sectionTitle={section.title} onDone={loadAll} />
                  </div>
                </div>
              </Card>
            ))}

            {/* Quick-add default sections */}
            <Card className="p-4">
              <p className="text-xs text-muted-foreground mb-3">افزودن بخش پیش‌فرض:</p>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_SECTIONS.filter((t) => !sections.some((s) => s.title === t)).map((title) => (
                  <Button key={title} variant="outline" size="sm" onClick={() => addSection(title)}>{title}</Button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Tab: Contact Info */}
        {tab === "contact" && (
          <Card className="p-5 space-y-4">
            <CardHeader className="p-0"><CardTitle>اطلاعات تماس و آدرس</CardTitle></CardHeader>
            <CardContent className="p-0 space-y-3">
              <div><Label>عنوان آدرس</Label><Input value={settings.addressTitle} onChange={(e) => setSettings((s) => ({ ...s, addressTitle: e.target.value }))} className="mt-1" /></div>
              <div><Label>آدرس</Label><Input value={settings.address} onChange={(e) => setSettings((s) => ({ ...s, address: e.target.value }))} className="mt-1" /></div>
              <div><Label>ایمیل</Label><Input value={settings.email} onChange={(e) => setSettings((s) => ({ ...s, email: e.target.value }))} className="mt-1" dir="ltr" /></div>
              <div><Label>ساعت کاری</Label><Input value={settings.hours} onChange={(e) => setSettings((s) => ({ ...s, hours: e.target.value }))} className="mt-1" /></div>
              <div><Label>URL نقشه (OpenStreetMap embed)</Label><Input value={settings.mapUrl} onChange={(e) => setSettings((s) => ({ ...s, mapUrl: e.target.value }))} className="mt-1 font-mono text-[11px]" dir="ltr" /></div>
              <Button onClick={saveSettings} loading={saving}>ذخیره اطلاعات تماس</Button>
            </CardContent>
          </Card>
        )}

        {message && <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">{message}</div>}
      </section>
    </main>
  );
}
