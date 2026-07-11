"use client";
import { useState } from "react";
import { login } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const doServerAndClientLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        login(data.user);
        router.push("/admin");
      } else {
        setErr(data.message || "خطا در ورود");
      }
    } catch {
      setErr("خطا در برقراری ارتباط با سرور Neon");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-10" dir="rtl">
      <form onSubmit={doServerAndClientLogin} className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] w-full max-w-sm space-y-5 p-6">
        <div>
          <h1 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold mb-2">ورود به پنل تکباکس</h1>
        </div>

        <div>
          <label className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color mb-1 block">نام کاربری</label>
          <input 
            value={username} 
            onChange={e => { setUsername(e.target.value); setErr(""); }} 
            className="input w-full" 
            placeholder="username" 
            dir="ltr" 
            required 
          />
        </div>
        
        <div>
          <label className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color mb-1 block">رمز عبور</label>
          <input 
            type="password"
            value={password} 
            onChange={e => { setPassword(e.target.value); setErr(""); }} 
            className="input w-full" 
            placeholder="••••••••" 
            dir="ltr" 
            required 
          />
        </div>

        {err && <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-[var(--danger)]">{err}</p>}
        
        <Button className="w-full" disabled={busy}>{busy ? "در حال ورود..." : "ورود"}</Button>
      </form>
    </main>
  );
}
