"use client";
import { useState } from "react";
import { login, allUsers } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

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
          <label className="text-xs text-muted-foreground">نام کاربری</label>
          <input value={u} onChange={e=>setU(e.target.value)} className="input mt-1" placeholder="sara / admin / nima ..." />
        </div>
        {err && <p className="text-xs text-[var(--tb-danger)]">{err}</p>}
        <Button className="w-full">ورود</Button>
        <div className="text-[11px] text-muted-foreground leading-6 border-t border-[var(--tb-border)] pt-3">
          کاربران تست:<br/>
          {allUsers.map(x => (
            <span key={x.username} className="block">{x.username} – {x.name} ({x.modules.join(",")})</span>
          ))}
        </div>
      </form>
    </main>
  );
}
