"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/effects/PageHeader";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BlobUploadField } from "@/components/admin/BlobUploadField";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { moduleMeta, type ModuleSlug } from "@/lib/content";

type AdminUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  roleFa?: string | null;
  status: string;
  job?: string | null;
  birthday?: string | null;
  modules: string[];
  avatar?: string | null;
  counts?: { posts: number; comments: number; ratings: number };
  verifiedType?: string | null;
  verifiedLabel?: string | null;
};

type Activity = {
  posts: Array<{ id: string; module: string; slug: string; title: string; published: boolean; views: number; likes: number; date: string }>;
  comments: Array<{ id: string; text: string; status: string; createdAt: string; post: { module: string; slug: string; title: string } }>;
  ratings: Array<{ id: string; value: number; updatedAt: string; post: { module: string; slug: string; title: string } }>;
  likes: Array<{ id: string; module: string; slug: string; createdAt: string }>;
};

const roleOptions = [
  { value: "super_admin", label: "مدیر کل" },
  { value: "editor", label: "ویراستار" },
  { value: "user", label: "کاربر" },
];
const statusOptions = [
  { value: "active", label: "فعال" },
  { value: "suspended", label: "تعلیق" },
  { value: "banned", label: "مسدود" },
];

function statusVariant(status: string) {
  if (status === "active") return "default" as const;
  if (status === "banned") return "destructive" as const;
  return "secondary" as const;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [query, setQuery] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");

  const allModules = Object.keys(moduleMeta) as ModuleSlug[];

  const loadUsers = async () => {
    const res = await fetch("/api/admin/users", { cache: "no-store" });
    const data = await res.json();
    if (Array.isArray(data)) setUsers(data);
  };

  const loadUser = async (id: string) => {
    if (!id) return;
    const res = await fetch(`/api/admin/users?id=${id}`, { cache: "no-store" });
    const data = await res.json();
    if (data.user) {
      setSelected(data.user);
      setActivity(data.activity || null);
      setPassword("");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);
  useEffect(() => {
    if (selectedId) loadUser(selectedId);
  }, [selectedId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => `${u.name} ${u.username} ${u.email} ${u.role} ${u.status}`.toLowerCase().includes(q));
  }, [users, query]);

  const updateSelected = (patch: Partial<AdminUser>) => setSelected((prev) => (prev ? { ...prev, ...patch } : prev));
  const toggleModule = (mod: string) => {
    if (!selected) return;
    const set = new Set(selected.modules || []);
    if (set.has(mod)) set.delete(mod);
    else set.add(mod);
    updateSelected({ modules: [...set] });
  };

  const save = async () => {
    if (!selected) return;
    setBusy(true);
    setMsg("");
    const payload: any = {
      id: selected.id,
      name: selected.name,
      email: selected.email,
      role: selected.role,
      roleFa: selected.roleFa || undefined,
      status: selected.status,
      job: selected.job || null,
      birthday: selected.birthday || null,
      modules: selected.modules || [],
      avatar: selected.avatar || null,
      verifiedType: selected.verifiedType || null,
      verifiedLabel: selected.verifiedLabel || null,
    };
    if (password.trim()) payload.password = password.trim();
    try {
      const res = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "save_failed");
      setMsg("کاربر ذخیره شد.");
      await loadUsers();
      await loadUser(selected.id);
    } catch (e: any) {
      setMsg(e?.message || "خطا در ذخیره کاربر");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-dvh px-4 py-10 space-y-6" dir="rtl">
      <section className="mx-auto max-w-7xl space-y-6">
        <PageHeader colorVar="--admin" title="مدیریت کاربران" titleClassName="text-[var(--admin)]" description="ویرایش پروفایل، نقش، دسترسی ماژول‌ها، وضعیت حساب و مشاهده فعالیت کاربران">
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/admin" variant="ghost" size="sm">داشبورد</ButtonLink>
            <ButtonLink href="/admin/moderation" variant="ghost" size="sm">Moderation</ButtonLink>
            <Button type="button" size="sm" onClick={loadUsers}>به‌روزرسانی</Button>
          </div>
        </PageHeader>

        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <Card className="overflow-hidden lg:sticky lg:top-24 lg:self-start p-0">
            <CardHeader className="p-3 border-b">
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جستجوی کاربر…" />
            </CardHeader>
            <ScrollArea className="max-h-[70vh]">
              <div className="divide-y divide-border/30">
                {filtered.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedId(u.id)}
                    className={`flex w-full items-center gap-3 p-3 text-right hover:bg-muted/30 ${selectedId === u.id ? "bg-muted/40" : ""}`}
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                      {u.avatar ? <Image src={u.avatar} alt={u.name} fill sizes="40px" className="object-cover" /> : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold flex items-center gap-1">
                        <span className="truncate">{u.name}</span>
                        {u.verifiedType && (
                          <VerifiedBadge type={u.verifiedType as "content" | "org" | "user"} label={u.verifiedLabel} size={13} />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono" dir="ltr">@{u.username}</div>
                    </div>
                    <Badge variant={statusVariant(u.status)}>{u.status}</Badge>
                  </button>
                ))}
                {!filtered.length && <div className="p-4 text-center text-sm text-muted-foreground">کاربری پیدا نشد.</div>}
              </div>
            </ScrollArea>
          </Card>

          <section className="space-y-5">
            {!selected ? (
              <Card className="p-8 text-center text-sm text-muted-foreground">یک کاربر را انتخاب کنید.</Card>
            ) : (
              <>
                <Card className="p-5 space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-full bg-muted">
                      {selected.avatar ? <Image src={selected.avatar} alt={selected.name} fill sizes="80px" className="object-cover" /> : null}
                    </div>
                    <div>
                      <h2 className="text-xl font-black">{selected.name}</h2>
                      <div className="font-mono text-xs text-muted-foreground" dir="ltr">@{selected.username}</div>
                      <div className="mt-2 flex gap-2">
                        <Badge variant={statusVariant(selected.status)}>{selected.status}</Badge>
                        <Badge variant="secondary">{selected.role}</Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1"><Label className="text-xs">نام</Label><Input value={selected.name} onChange={(e) => updateSelected({ name: e.target.value })} /></div>
                    <div className="space-y-1"><Label className="text-xs">ایمیل</Label><Input value={selected.email} onChange={(e) => updateSelected({ email: e.target.value })} dir="ltr" /></div>
                    <div className="space-y-1"><Label className="text-xs">عنوان نقش فارسی</Label><Input value={selected.roleFa || ""} onChange={(e) => updateSelected({ roleFa: e.target.value })} /></div>
                    <div className="space-y-1"><Label className="text-xs">شغل/توضیح</Label><Input value={selected.job || ""} onChange={(e) => updateSelected({ job: e.target.value })} /></div>
                    <div className="space-y-1"><Label className="text-xs">تاریخ تولد</Label><Input value={selected.birthday || ""} onChange={(e) => updateSelected({ birthday: e.target.value })} /></div>
                    <div className="space-y-1"><Label className="text-xs">آواتار URL</Label><Input value={selected.avatar || ""} onChange={(e) => updateSelected({ avatar: e.target.value })} dir="ltr" /></div>
                    {/* Verification badge */}
                    <div className="space-y-1">
                      <Label className="text-xs flex items-center gap-1.5">
                        نشان تایید هویت
                        {selected.verifiedType && (
                          <VerifiedBadge type={selected.verifiedType as "content" | "org" | "user"} label={selected.verifiedLabel} size={14} />
                        )}
                      </Label>
                      <select
                        value={selected.verifiedType || ""}
                        onChange={(e) => updateSelected({ verifiedType: e.target.value || null, verifiedLabel: e.target.value ? selected.verifiedLabel : null })}
                        className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                      >
                        <option value="">بدون نشان</option>
                        <option value="user">🟢 کاربر تایید شده</option>
                        <option value="content">🔵 تولید کننده محتوای تایید شده</option>
                        <option value="org">🟣 کاربر سازمانی تایید شده</option>
                      </select>
                    </div>
                    {selected.verifiedType === "org" && (
                      <div className="space-y-1">
                        <Label className="text-xs">برچسب سازمانی (نمایش در tooltip)</Label>
                        <Input
                          value={selected.verifiedLabel || ""}
                          onChange={(e) => updateSelected({ verifiedLabel: e.target.value || null })}
                          placeholder="مثلاً: کارشناس فناوری اطلاعات - بانک ملت"
                        />
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label className="text-xs">نقش</Label>
                      <Select value={selected.role} onValueChange={(v) => updateSelected({ role: v as string })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((r) => (
                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">وضعیت</Label>
                      <Select value={selected.status} onValueChange={(v) => updateSelected({ status: v as string })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <BlobUploadField label="آپلود آواتار" kind="avatar" folder="avatars" accept="image/jpeg,image/png,image/webp" onUploaded={(r) => updateSelected({ avatar: r.url })} />

                  <div>
                    <div className="mb-2 font-bold text-sm">دسترسی ماژول‌ها</div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {allModules.map((m) => (
                        <Label key={m} className="flex items-center gap-2 rounded-md border p-2 cursor-pointer hover:bg-muted/30">
                          <Checkbox checked={selected.modules.includes(m)} onCheckedChange={() => toggleModule(m)} />
                          <span className="text-xs">{moduleMeta[m].titleFa}</span>
                        </Label>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                    <div className="space-y-1">
                      <Label className="text-xs">Reset password</Label>
                      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="حداقل ۶ کاراکتر" />
                    </div>
                    <Button type="button" onClick={save} disabled={busy} loading={busy}>
                      ذخیره کاربر
                    </Button>
                  </div>
                  {msg && <div className="text-sm text-muted-foreground">{msg}</div>}
                </Card>

                <div className="grid gap-3 sm:grid-cols-3">
                  <Card className="p-4"><div className="text-xs text-muted-foreground">محتوا</div><b>{(selected.counts?.posts || 0).toLocaleString("fa-IR")}</b></Card>
                  <Card className="p-4"><div className="text-xs text-muted-foreground">دیدگاه</div><b>{(selected.counts?.comments || 0).toLocaleString("fa-IR")}</b></Card>
                  <Card className="p-4"><div className="text-xs text-muted-foreground">امتیاز</div><b>{(selected.counts?.ratings || 0).toLocaleString("fa-IR")}</b></Card>
                </div>

                {activity && (
                  <div className="grid gap-5 lg:grid-cols-2">
                    <Card className="p-4">
                      <CardTitle className="text-sm mb-3">آخرین محتواها</CardTitle>
                      {activity.posts.map((p) => (
                        <div key={p.id} className="border-b border-border/30 py-2">
                          <Link href={`/${p.module}/${p.slug}`} target="_blank" className="font-bold hover:text-primary text-sm">{p.title}</Link>
                          <div className="text-xs text-muted-foreground">{p.module} • {p.published ? "منتشر" : "پیش‌نویس"} • {p.views} views</div>
                        </div>
                      ))}
                      {!activity.posts.length && <div className="text-sm text-muted-foreground">محتوایی ندارد.</div>}
                    </Card>
                    <Card className="p-4">
                      <CardTitle className="text-sm mb-3">آخرین دیدگاه‌ها</CardTitle>
                      {activity.comments.map((c) => (
                        <div key={c.id} className="border-b border-border/30 py-2">
                          <Link href={`/${c.post.module}/${c.post.slug}`} target="_blank" className="font-bold hover:text-primary text-sm">{c.post.title}</Link>
                          <p className="text-xs text-muted-foreground line-clamp-2">{c.text}</p>
                        </div>
                      ))}
                      {!activity.comments.length && <div className="text-sm text-muted-foreground">دیدگاهی ندارد.</div>}
                    </Card>
                    <Card className="p-4">
                      <CardTitle className="text-sm mb-3">آخرین امتیازها</CardTitle>
                      {activity.ratings.map((r) => (
                        <div key={r.id} className="border-b border-border/30 py-2">
                          <Link href={`/${r.post.module}/${r.post.slug}`} target="_blank" className="font-bold hover:text-primary text-sm">{r.post.title}</Link>
                          <div className="text-xs text-muted-foreground">امتیاز: {r.value}</div>
                        </div>
                      ))}
                      {!activity.ratings.length && <div className="text-sm text-muted-foreground">امتیازی ندارد.</div>}
                    </Card>
                    <Card className="p-4">
                      <CardTitle className="text-sm mb-3">آخرین پسندها</CardTitle>
                      {activity.likes.map((l) => (
                        <div key={l.id} className="border-b border-border/30 py-2">
                          <Link href={`/${l.module}/${l.slug}`} target="_blank" className="font-bold hover:text-primary text-sm">/{l.module}/{l.slug}</Link>
                        </div>
                      ))}
                      {!activity.likes.length && <div className="text-sm text-muted-foreground">پسندی ندارد.</div>}
                    </Card>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
