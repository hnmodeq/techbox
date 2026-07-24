"use client";

import { useEffect, useState, useCallback } from "react";
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

type User = { id: string; name: string; username: string; job: string | null; roleFa: string | null; avatar: string | null; verifiedType: string | null };
type Member = { id: string; sectionId: string; name: string; role: string; avatar: string | null; order: number };
type Section = { id: string; title: string; order: number; enabled: boolean; members: Member[] };

const DEFAULT_SECTIONS = [
  "تیم مدیریت", "تیم طراحی گرافیک", "تیم محتوای چند رسانه‌ای",
  "تیم تحریریه", "کارشناسان فنی", "تیم پشتیبانی",
  "کارشناسان فروش", "تیم مارکتینگ", "خانواده تکباکس",
];

type TabId = "sections" | "description" | "contact";

// ─── User Pool ──────────────────────────────────────────────────────────────

function UserPool({ sections, onRefresh }: { sections: Section[]; onRefresh: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingTo, setAddingTo] = useState<string | null>(null); // userId being assigned
  const [showDropdown, setShowDropdown] = useState<string | null>(null); // which user's dropdown is open

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/users/search", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setUsers(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Which sections is a user already in?
  const userSections = (userId: string) => {
    const result: string[] = [];
    for (const s of sections) {
      if (s.members.some((m) => m.name === users.find((u) => u.id === userId)?.name)) {
        result.push(s.title);
      }
    }
    return result;
  };

  const addUserToSection = async (user: User, sectionId: string) => {
    setAddingTo(user.id);
    setShowDropdown(null);
    await fetch("/api/admin/about/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId, userId: user.id }),
    });
    setAddingTo(null);
    onRefresh();
  };

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || (u.job || "").toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
  });

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold">کاربران ثبت‌نام شده</h3>
        <Badge variant="secondary" className="text-[10px]">{filtered.length.toLocaleString("fa-IR")} نفر</Badge>
      </div>
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="جستجوی نام، سمت یا نام کاربری..."
        className="h-8 text-sm mb-3"
      />
      <div className="max-h-[400px] overflow-y-auto space-y-1" style={{ scrollbarWidth: "thin" }}>
        {loading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">کاربری یافت نشد</p>
        ) : (
          filtered.map((user) => {
            const inSections = userSections(user.id);
            return (
              <div key={user.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors group relative">
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.name} width={32} height={32} className="h-8 w-8 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold truncate">{user.name}</span>
                    {user.verifiedType && <Badge variant="secondary" className="text-[8px] px-1 py-0">✓</Badge>}
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate block">{user.job || user.roleFa || user.username}</span>
                </div>
                {/* Sections this user is in */}
                {inSections.length > 0 && (
                  <div className="flex flex-wrap gap-1 shrink-0 max-w-[140px]">
                    {inSections.map((s) => (
                      <span key={s} className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full truncate">{s}</span>
                    ))}
                  </div>
                )}
                {/* Add button */}
                <div className="relative shrink-0">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setShowDropdown(showDropdown === user.id ? null : user.id)}
                    disabled={addingTo === user.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {addingTo === user.id ? "..." : "+ افزودن"}
                  </Button>
                  {showDropdown === user.id && sections.length > 0 && (
                    <div className="absolute z-50 left-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg min-w-[200px] max-h-48 overflow-y-auto">
                      {sections.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => addUserToSection(user, s.id)}
                          className="w-full text-right px-3 py-2 text-xs hover:bg-accent transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span>{s.title}</span>
                          <span className="text-[10px] text-muted-foreground">{s.members.length} عضو</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
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

  const autoPopulateVerified = async () => {
    const familySection = sections.find((s) => s.title.includes("خانواده"));
    if (!familySection) { setMessage("ابتدا بخش «خانواده تکباکس» را ایجاد کنید"); return; }
    try {
      const res = await fetch("/api/admin/users/search?verified=1");
      const users: User[] = await res.json();
      for (const u of users) {
        await fetch("/api/admin/about/members", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sectionId: familySection.id, userId: u.id }),
        });
      }
      setMessage(`${users.length.toLocaleString("fa-IR")} کاربر تایید شده اضافه شدند ✓`);
      loadAll();
    } catch { setMessage("خطا"); }
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "sections", label: "تیم‌ها" },
    { id: "description", label: "توضیحات" },
    { id: "contact", label: "اطلاعات تماس" },
  ];

  if (loading) return <main className="min-h-dvh px-4 py-10" dir="rtl"><p className="text-muted-foreground">در حال بارگذاری...</p></main>;

  return (
    <main className="min-h-dvh px-4 py-10 space-y-6" dir="rtl">
      <section className="mx-auto max-w-5xl space-y-6">
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
          <div className="grid lg:grid-cols-[1fr_340px] gap-4 items-start">
            {/* Left: Sections */}
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
                  <div className="p-4 space-y-1">
                    {section.members.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground text-center py-3">هنوز عضوی ندارد — از لیست کاربران اضافه کنید</p>
                    ) : (
                      section.members.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 px-3 py-1.5 rounded-md hover:bg-accent/30 group/mem">
                          {member.avatar ? (
                            <Image src={member.avatar} alt={member.name} width={24} height={24} className="h-6 w-6 rounded-full object-cover" />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-muted" />
                          )}
                          <span className="text-xs font-medium flex-1 truncate">{member.name}</span>
                          <span className="text-[10px] text-muted-foreground truncate">{member.role || ""}</span>
                          <button onClick={() => deleteMember(member.id, section.id)} className="text-destructive text-xs opacity-0 group-hover/mem:opacity-100 transition-opacity cursor-pointer">×</button>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              ))}

              {/* Quick-add default sections */}
              {DEFAULT_SECTIONS.filter((t) => !sections.some((s) => s.title === t)).length > 0 && (
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground mb-3">افزودن بخش پیش‌فرض:</p>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_SECTIONS.filter((t) => !sections.some((s) => s.title === t)).map((title) => (
                      <Button key={title} variant="outline" size="sm" onClick={() => addSection(title)}>{title}</Button>
                    ))}
                  </div>
                </Card>
              )}

              <Button variant="outline" size="sm" onClick={autoPopulateVerified}>
                افزودن خودکار کاربران تایید شده به «خانواده تکباکس»
              </Button>
            </div>

            {/* Right: User Pool */}
            <div className="lg:sticky lg:top-4">
              <UserPool sections={sections} onRefresh={loadAll} />
            </div>
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
