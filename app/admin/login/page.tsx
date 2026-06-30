"use client";
import { useState } from "react";
import { login, allUsers } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ModuleBadge } from "@/components/ui/ModuleBadge";
import { type ModuleSlug, moduleMeta } from "@/lib/content";

export default function AdminLogin() {
  const [u, setU] = useState("sara");
  const [err, setErr] = useState("");
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = login(u);
    if (user) router.push("/admin");
    else setErr("کاربر یافت نشد");
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4" dir="rtl">
      <form onSubmit={submit} className="card w-full max-w-sm p-6 space-y-4">
        <h1 className="text-xl font-black">ورود ویراستار</h1>
        <div>
          <label className="text-xs text-[var(--tb-muted-foreground)]">نام کاربری</label>
          <input value={u} onChange={e=>setU(e.target.value)} className="input mt-1" placeholder="sara / admin / nima ..." />
        </div>
        {err && <p className="text-xs text-[var(--tb-danger)]">{err}</p>}
        <Button className="w-full">ورود</Button>
        <div className="text-[11px] text-[var(--tb-muted-foreground)] leading-6 border-t border-[var(--tb-border)] pt-3">
          کاربران تست:<br/>
          {allUsers.map(x => (
            <span key={x.username} className="block rounded-[var(--tb-radius-md)] border border-[var(--tb-border)] p-2">
              <span className="font-mono text-[10px] text-[var(--tb-foreground)]">{x.username}</span> – {x.name}
              <span className="mt-1 flex flex-wrap gap-1">
                {x.modules.map(m => <ModuleBadge key={m} module={m as ModuleSlug}>{moduleMeta[m as ModuleSlug]?.titleFa || m}</ModuleBadge>)}
              </span>
            </span>
          ))}
        </div>
      </form>
    </main>
  );
}
