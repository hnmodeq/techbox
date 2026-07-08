"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/effects/PageHeader";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BlobUploadField } from "@/components/admin/BlobUploadField";
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
  if (status === "active") return "success" as const;
  if (status === "banned") return "danger" as const;
  return "warning" as const;
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

  useEffect(() => { loadUsers(); }, []);
  useEffect(() => { if (selectedId) loadUser(selectedId); }, [selectedId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => `${u.name} ${u.username} ${u.email} ${u.role} ${u.status}`.toLowerCase().includes(q));
  }, [users, query]);

  const updateSelected = (patch: Partial<AdminUser>) => setSelected((prev) => prev ? { ...prev, ...patch } : prev);
  const toggleModule = (module: string) => {
    if (!selected) return;
    const set = new Set(selected.modules || []);
    if (set.has(module)) set.delete(module); else set.add(module);
    updateSelected({ modules: [...set] });
  };

  const save = async () => {
    if (!selected) return;
    setBusy(true); setMsg("");
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
    <main className="min-h-dvh px-4 py-10" dir="rtl">
      <section className="mx-auto max-w-7xl space-y-6">
        <PageHeader colorVar="--admin" title="مدیریت کاربران" titleClassName="text-[var(--admin)]" description="ویرایش پروفایل، نقش، دسترسی ماژول‌ها، وضعیت حساب و مشاهده فعالیت کاربران">
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/admin" variant="ghost" size="sm">داشبورد</ButtonLink>
            <ButtonLink href="/admin/moderation" variant="ghost" size="sm">Moderation</ButtonLink>
            <Button type="button" size="sm" onClick={loadUsers}>به‌روزرسانی</Button>
          </div>
        </PageHeader>

        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] shadow-[var(--shadow-size)] overflow-hidden lg:sticky lg:top-24 lg:self-start">
            <div className="p-3 border-b-[length:var(--border-size)] border-[var(--border-color)]">
              <input value={query} onChange={(e) => setQuery(e.target.value)} className="input" placeholder="جستجوی کاربر…" />
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {filtered.map((u) => (
                <button key={u.id} type="button" onClick={() => setSelectedId(u.id)} className={`flex w-full items-center gap-3 p-3 text-right hover:bg-[var(--muted-background)]/30 border-b border-[var(--border-color)]/30 ${selectedId === u.id ? "bg-[var(--muted-background)]/40" : ""}`}>
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[var(--muted-background)]">
                    {u.avatar ? <Image src={u.avatar} alt={u.name} fill sizes="40px" className="object-cover" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-[var(--primary-text)] truncate">{u.name}</div>
                    <div className="text-xs paragraph-color font-mono" dir="ltr">@{u.username}</div>
                  </div>
                  <Badge variant={statusVariant(u.status)}>{u.status}</Badge>
                </button>
              ))}
              {!filtered.length && <div className="p-4 text-center paragraph-color">کاربری پیدا نشد.</div>}
            </div>
          </aside>

          <section className="space-y-5">
            {!selected ? (
              <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-8 text-center paragraph-color">یک کاربر را انتخاب کنید.</div>
            ) : (
              <>
                <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-size)] space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-full bg-[var(--muted-background)]">
                      {selected.avatar ? <Image src={selected.avatar} alt={selected.name} fill sizes="80px" className="object-cover" /> : null}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-[var(--primary-text)]">{selected.name}</h2>
                      <div className="font-mono text-xs paragraph-color" dir="ltr">@{selected.username}</div>
                      <div className="mt-2 flex gap-2"><Badge variant={statusVariant(selected.status)}>{selected.status}</Badge><Badge variant="secondary">{selected.role}</Badge></div>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <label><span className="paragraph-color text-sm">نام</span><input className="input mt-1" value={selected.name} onChange={(e)=>updateSelected({ name: e.target.value })} /></label>
                    <label><span className="paragraph-color text-sm">ایمیل</span><input className="input mt-1" value={selected.email} onChange={(e)=>updateSelected({ email: e.target.value })} dir="ltr" /></label>
                    <label><span className="paragraph-color text-sm">عنوان نقش فارسی</span><input className="input mt-1" value={selected.roleFa || ""} onChange={(e)=>updateSelected({ roleFa: e.target.value })} /></label>
                    <label><span className="paragraph-color text-sm">شغل/توضیح</span><input className="input mt-1" value={selected.job || ""} onChange={(e)=>updateSelected({ job: e.target.value })} /></label>
                    <label><span className="paragraph-color text-sm">تاریخ تولد</span><input className="input mt-1" value={selected.birthday || ""} onChange={(e)=>updateSelected({ birthday: e.target.value })} /></label>
                    <label><span className="paragraph-color text-sm">آواتار URL</span><input className="input mt-1" value={selected.avatar || ""} onChange={(e)=>updateSelected({ avatar: e.target.value })} dir="ltr" /></label>
                    <label><span className="paragraph-color text-sm">نقش</span><select className="input mt-1" value={selected.role} onChange={(e)=>updateSelected({ role: e.target.value })}>{roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select></label>
                    <label><span className="paragraph-color text-sm">وضعیت</span><select className="input mt-1" value={selected.status} onChange={(e)=>updateSelected({ status: e.target.value })}>{statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></label>
                  </div>

                  <BlobUploadField label="آپلود آواتار" kind="avatar" folder="avatars" accept="image/jpeg,image/png,image/webp" onUploaded={(r)=>updateSelected({ avatar: r.url })} />

                  <div>
                    <div className="mb-2 font-bold text-[var(--primary-text)]">دسترسی ماژول‌ها</div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {allModules.map(m => <label key={m} className="flex items-center gap-2 rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] p-2"><input type="checkbox" checked={selected.modules.includes(m)} onChange={()=>toggleModule(m)} /> <span>{moduleMeta[m].titleFa}</span></label>)}
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                    <label><span className="paragraph-color text-sm">Reset password</span><input type="password" className="input mt-1" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="حداقل ۶ کاراکتر" /></label>
                    <Button type="button" onClick={save} disabled={busy}>{busy ? "در حال ذخیره…" : "ذخیره کاربر"}</Button>
                  </div>
                  {msg && <div className="paragraph-color">{msg}</div>}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-4"><div className="paragraph-color">محتوا</div><b>{(selected.counts?.posts || 0).toLocaleString("fa-IR")}</b></div>
                  <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-4"><div className="paragraph-color">دیدگاه</div><b>{(selected.counts?.comments || 0).toLocaleString("fa-IR")}</b></div>
                  <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-4"><div className="paragraph-color">امتیاز</div><b>{(selected.counts?.ratings || 0).toLocaleString("fa-IR")}</b></div>
                </div>

                {activity && (
                  <div className="grid gap-5 lg:grid-cols-2">
                    <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-4"><h3 className="font-bold mb-3">آخرین محتواها</h3>{activity.posts.map(p => <div key={p.id} className="border-b border-[var(--border-color)]/30 py-2"><Link href={`/${p.module}/${p.slug}`} target="_blank" className="font-bold hover:text-[var(--home)]">{p.title}</Link><div className="text-xs paragraph-color">{p.module} • {p.published ? "منتشر" : "پیش‌نویس"} • {p.views} views</div></div>)}{!activity.posts.length && <div className="paragraph-color">محتوایی ندارد.</div>}</div>
                    <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-4"><h3 className="font-bold mb-3">آخرین دیدگاه‌ها</h3>{activity.comments.map(c => <div key={c.id} className="border-b border-[var(--border-color)]/30 py-2"><Link href={`/${c.post.module}/${c.post.slug}`} target="_blank" className="font-bold hover:text-[var(--home)]">{c.post.title}</Link><p className="text-xs paragraph-color line-clamp-2">{c.text}</p></div>)}{!activity.comments.length && <div className="paragraph-color">دیدگاهی ندارد.</div>}</div>
                    <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-4"><h3 className="font-bold mb-3">آخرین امتیازها</h3>{activity.ratings.map(r => <div key={r.id} className="border-b border-[var(--border-color)]/30 py-2"><Link href={`/${r.post.module}/${r.post.slug}`} target="_blank" className="font-bold hover:text-[var(--home)]">{r.post.title}</Link><div className="text-xs paragraph-color">امتیاز: {r.value}</div></div>)}{!activity.ratings.length && <div className="paragraph-color">امتیازی ندارد.</div>}</div>
                    <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-4"><h3 className="font-bold mb-3">آخرین پسندها</h3>{activity.likes.map(l => <div key={l.id} className="border-b border-[var(--border-color)]/30 py-2"><Link href={`/${l.module}/${l.slug}`} target="_blank" className="font-bold hover:text-[var(--home)]">/{l.module}/{l.slug}</Link></div>)}{!activity.likes.length && <div className="paragraph-color">پسندی ندارد.</div>}</div>
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
