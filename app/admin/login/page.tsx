"use client";
import { useMemo, useState } from "react";
import { login, allUsers } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ModuleBadge } from "@/components/ui/ModuleBadge";
import { type ModuleSlug, moduleMeta } from "@/lib/content";
import { Badge } from "@/components/ui/Badge";

export default function AdminLogin() {
  const [u, setU] = useState("sara");
  const [err, setErr] = useState("");
  const router = useRouter();

  const selectedUser = useMemo(() => allUsers.find(x => x.username === u.trim().toLowerCase()) || null, [u]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const user = login(u.trim());
    if (user) router.push("/admin");
    else setErr("کاربر یافت نشد");
  };

  const quickLogin = (username: string) => {
    setU(username);
    setErr("");
    const user = login(username);
    if (user) router.push("/admin");
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-10" dir="rtl">
      <form onSubmit={submit} className="card w-full max-w-lg space-y-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black">ورود ویراستار</h1>
            <p className="mt-1 text-[11px] text-[var(--tb-muted-foreground)]">ورود دمو با کاربران منبع `data/users.json` انجام می‌شود.</p>
          </div>
          <Badge variant="info">Demo Auth</Badge>
        </div>

        <div>
          <label className="text-xs text-[var(--tb-muted-foreground)]">نام کاربری</label>
          <div className="mt-1 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <input value={u} onChange={e=>{setU(e.target.value); setErr("");}} className="input" placeholder="sara / admin / nima ..." dir="ltr" />
            <Button>ورود</Button>
          </div>
        </div>

        {selectedUser && (
          <div className="rounded-[var(--tb-radius-lg)] border border-[var(--tb-border)] bg-[var(--tb-surface-1)]/50 p-3 text-[11px]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-bold">{selectedUser.name}</div>
                <div className="font-mono text-[10px] text-[var(--tb-muted-foreground)]">{selectedUser.email}</div>
              </div>
              <ModuleBadge module={selectedUser.role === "super_admin" ? "vip" : "info"}>{selectedUser.role === "super_admin" ? "مدیر کل" : "ویراستار"}</ModuleBadge>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedUser.modules.map(m => <ModuleBadge key={m} module={m as ModuleSlug}>{moduleMeta[m as ModuleSlug]?.titleFa || m}</ModuleBadge>)}
            </div>
          </div>
        )}

        {err && <p className="text-xs text-[var(--tb-danger)]">{err}</p>}

        <div className="border-t border-[var(--tb-border)] pt-4">
          <div className="mb-2 text-[11px] font-bold">ورود سریع تست</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {allUsers.map(x => (
              <Button key={x.username} type="button" variant={x.username === u ? "primary" : "ghost"} size="xs" onClick={()=>quickLogin(x.username)} className="justify-start text-right">
                <span className="font-mono">{x.username}</span>
                <span className="truncate text-[10px] opacity-80">{x.name}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2 border-t border-[var(--tb-border)] pt-4 text-[11px] leading-6 text-[var(--tb-muted-foreground)]">
          <div className="font-bold text-[var(--tb-foreground)]">کاربران تست و دسترسی‌ها</div>
          {allUsers.map(x => (
            <div key={x.username} className="rounded-[var(--tb-radius-md)] border border-[var(--tb-border)] p-2">
              <span className="font-mono text-[10px] text-[var(--tb-foreground)]">{x.username}</span> – {x.name}
              <span className="mt-1 flex flex-wrap gap-1">
                {x.modules.map(m => <ModuleBadge key={m} module={m as ModuleSlug}>{moduleMeta[m as ModuleSlug]?.titleFa || m}</ModuleBadge>)}
              </span>
            </div>
          ))}
        </div>
      </form>
    </main>
  );
}
