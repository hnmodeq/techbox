"use client";
import { useMemo, useState } from "react";
import { login, allUsers } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModuleBadge } from "@/components/ui/module-badge";
import { type ModuleSlug, moduleMeta } from "@/lib/content";
import { Badge } from "@/components/ui/badge";

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
      <form onSubmit={submit} className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] w-full max-w-lg space-y-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold ">ورود ویراستار و مدیران</h1>
            <p className="mt-1 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">متصل به پایگاه داده Neon PostgreSQL و احراز هویت کوکی</p>
          </div>
          <Badge variant="info">Real Auth</Badge>
        </div>

        <div>
          <label className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">نام کاربری</label>
          <div className="mt-1 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <input value={u} onChange={e => { setU(e.target.value); setErr(""); }} className="input" placeholder="sara / admin / nima ..." dir="ltr" />
            <Button disabled={busy}>{busy ? "..." : "ورود"}</Button>
          </div>
        </div>

        {selectedUser && (
          <div className="rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)]/50 p-3 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="">{selectedUser.name}</div>
                <div className="font-mono text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">{selectedUser.email}</div>
              </div>
              <ModuleBadge module={selectedUser.role === "super_admin" ? "vip" : "info"}>{selectedUser.role === "super_admin" ? "مدیر کل" : "ویراستار"}</ModuleBadge>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedUser.modules.map(m => <ModuleBadge key={m} module={m as ModuleSlug}>{moduleMeta[m as ModuleSlug]?.titleFa || m}</ModuleBadge>)}
            </div>
          </div>
        )}

        {err && <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-[var(--danger)]">{err}</p>}
      </form>
    </main>
  );
}
