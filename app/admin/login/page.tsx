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
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const selectedUser = useMemo(() => allUsers.find(x => x.username === u.trim().toLowerCase()) || null, [u]);

  const doServerAndClientLogin = async (username: string) => {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password: "techbox123" })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        login(username.trim());
        router.push("/admin");
      } else {
        setErr(data.error === "not found" ? "کاربر یافت نشد" : "خطا در ورود");
      }
    } catch {
      setErr("خطا در برقراری ارتباط با سرور Neon");
    } finally {
      setBusy(false);
    }
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    doServerAndClientLogin(u.trim());
  };

  const quickLogin = (username: string) => {
    setU(username);
    doServerAndClientLogin(username);
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-10" dir="rtl">
      <form onSubmit={submit} className="card w-full max-w-lg space-y-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="tb-text-lg ">ورود ویراستار و مدیران</h1>
            <p className="mt-1 tb-text-sm text-[var(--tb-fg-muted)]">متصل به پایگاه داده Neon PostgreSQL و احراز هویت کوکی</p>
          </div>
          <Badge variant="info">Real Auth</Badge>
        </div>

        <div>
          <label className="tb-text-sm text-[var(--tb-fg-muted)]">نام کاربری</label>
          <div className="mt-1 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <input value={u} onChange={e => { setU(e.target.value); setErr(""); }} className="input" placeholder="sara / admin / nima ..." dir="ltr" />
            <Button disabled={busy}>{busy ? "..." : "ورود"}</Button>
          </div>
        </div>

        {selectedUser && (
          <div className="rounded-[var(--tb-radius-lg)] border border-[var(--tb-border)] bg-[var(--tb-bg-secondary)]/50 p-3 tb-text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="">{selectedUser.name}</div>
                <div className="font-mono tb-text-sm text-[var(--tb-fg-muted)]">{selectedUser.email}</div>
              </div>
              <ModuleBadge module={selectedUser.role === "super_admin" ? "vip" : "info"}>{selectedUser.role === "super_admin" ? "مدیر کل" : "ویراستار"}</ModuleBadge>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedUser.modules.map(m => <ModuleBadge key={m} module={m as ModuleSlug}>{moduleMeta[m as ModuleSlug]?.titleFa || m}</ModuleBadge>)}
            </div>
          </div>
        )}

        {err && <p className="tb-text-sm text-[var(--tb-danger)]">{err}</p>}

        <div className="border-t border-[var(--tb-border)] pt-4">
          <div className="mb-2 tb-text-sm ">ورود سریع تست</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {allUsers.map(x => (
              <Button key={x.username} disabled={busy} type="button" variant={x.username === u ? "primary" : "ghost"} size="xs" onClick={() => quickLogin(x.username)} className="justify-start text-right">
                <span className="font-mono">{x.username}</span>
                <span className="truncate tb-text-sm opacity-80">{x.name}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2 border-t border-[var(--tb-border)] pt-4 tb-text-sm text-[var(--tb-fg-muted)]">
          <div className="text-[var(--tb-fg-primary)]">کاربران تست و دسترسی‌ها</div>
          {allUsers.map(x => (
            <div key={x.username} className="rounded-[var(--tb-radius-md)] border border-[var(--tb-border)] p-2">
              <span className="font-mono tb-text-sm text-[var(--tb-fg-primary)]">{x.username}</span> – {x.name}
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
