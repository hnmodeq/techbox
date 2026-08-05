"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth.provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";

export type AuthPageMode = "login" | "register";
type View = "form" | "verification";

function safeRedirect(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/login") || value.startsWith("/admin/login")) return "";
  return value;
}

export function UnifiedLoginPage({
  initialMode = "login",
  redirectTo,
}: {
  initialMode?: AuthPageMode;
  redirectTo?: string;
}) {
  const [mode, setMode] = useState<AuthPageMode>(initialMode);
  const [view, setView] = useState<View>("form");
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const destinationFor = (user: { role?: string } | null | undefined) => {
    const requested = safeRedirect(redirectTo);
    const staff = Boolean(user?.role && user.role !== "user");
    if (requested.startsWith("/admin") && !staff) return "/account";
    return requested || (staff ? "/admin" : "/account");
  };

  const switchMode = (next: AuthPageMode) => {
    setMode(next);
    setView("form");
    setError("");
  };

  const submitLogin = async () => {
    if (!identifier.trim() || password.length < 6) {
      setError("ایمیل یا نام کاربری و رمز عبور را وارد کنید.");
      return;
    }
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username: identifier.trim(), password }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.user) {
      if (data.error === "email_not_verified") {
        setPendingEmail(data.email || "");
        setView("verification");
        return;
      }
      throw new Error(data.message || "ورود انجام نشد.");
    }
    await login();
    toast.success("خوش آمدید");
    router.replace(destinationFor(data.user));
    router.refresh();
  };

  const submitRegister = async () => {
    if (name.trim().length < 2 || username.trim().length < 3 || !email.includes("@")) {
      setError("نام، نام کاربری و ایمیل معتبر را کامل کنید.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      setError("نام کاربری فقط شامل حروف انگلیسی، عدد و آندرلاین است.");
      return;
    }
    if (password.length < 8) {
      setError("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }
    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن یکسان نیستند.");
      return;
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || data.error || "ثبت‌نام انجام نشد.");
    if (data.needsVerification) {
      setPendingEmail(data.email || email.trim().toLowerCase());
      setView("verification");
      return;
    }
    if (data.user) {
      await login();
      toast.success("حساب شما ساخته شد");
      router.replace(destinationFor(data.user));
      router.refresh();
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (mode === "login") await submitLogin();
      else await submitRegister();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "ارتباط با سرور برقرار نشد.");
    } finally {
      setBusy(false);
    }
  };

  const resendVerification = async () => {
    if (!pendingEmail || busy) return;
    setBusy(true);
    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "ارسال مجدد انجام نشد.");
      toast.success("لینک تأیید دوباره ارسال شد");
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : "ارسال مجدد انجام نشد.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-svh bg-black text-white" dir="ltr">
      <Toaster dir="rtl" />
      <div className="grid min-h-svh lg:grid-cols-[36%_64%]">
        <section className="relative hidden overflow-hidden border-e border-white/10 bg-[#07100d] lg:block" aria-label="معرفی تکباکس">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_42%_85%,rgba(245,179,1,.46),transparent_34%),radial-gradient(circle_at_12%_68%,rgba(29,209,161,.36),transparent_38%),linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.72))]" />
          <div aria-hidden="true" className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,.22)_1px,transparent_1px)] [background-size:6px_6px] [mask-image:linear-gradient(to_bottom,transparent,black_45%,black)]" />
          <div className="relative flex h-full flex-col justify-between p-10 xl:p-14" dir="rtl">
            <Link href="/" className="inline-flex w-fit items-center gap-2 text-xs text-white/65 transition-colors hover:text-white">
              بازگشت به سایت <ArrowLeft className="size-3.5" />
            </Link>
            <div className="pb-16">
              <Image src="/logo.png" alt="تکباکس" width={54} height={54} className="mb-6 size-14 object-contain" priority />
              <p className="max-w-xs text-3xl font-black leading-[1.45]">یک درگاه برای همه اعضای تکباکس</p>
              <p className="mt-3 max-w-sm text-sm leading-7 text-white/60">کاربران، نویسندگان و مدیران از همین صفحه امن وارد می‌شوند؛ سطح دسترسی بعد از ورود از حساب واقعی تعیین می‌شود.</p>
            </div>
          </div>
        </section>

        <section className="relative flex min-h-svh items-center justify-center px-5 py-16" dir="rtl">
          <Link href="/" className="absolute end-5 top-5 inline-flex items-center gap-2 text-xs text-white/55 transition-colors hover:text-white lg:hidden">
            بازگشت به سایت <ArrowLeft className="size-3.5" />
          </Link>
          <div className="w-full max-w-[380px]">
            <div className="mb-7 text-center">
              <Image src="/logo.png" alt="تکباکس" width={48} height={48} className="mx-auto mb-5 size-12 object-contain" priority />
              <h1 className="text-2xl font-black">{view === "verification" ? "تأیید ایمیل" : mode === "login" ? "ورود به تکباکس" : "عضویت در تکباکس"}</h1>
              <p className="mt-2 text-xs text-white/45">ورود مشترک کاربران، نویسندگان و مدیران</p>
            </div>

            {view === "verification" ? (
              <div className="space-y-4 text-center" dir="rtl">
                <div className="rounded-md border border-emerald-500/25 bg-emerald-500/10 p-5">
                  <p className="font-bold text-emerald-300">ایمیل تأیید ارسال شد</p>
                  <p className="mt-2 break-all text-xs text-white/55" dir="ltr">{pendingEmail}</p>
                  <p className="mt-3 text-xs leading-6 text-white/45">صندوق ورودی و پوشه هرزنامه را بررسی کنید.</p>
                </div>
                {error && <p className="text-xs text-red-300">{error}</p>}
                <Button type="button" onClick={resendVerification} loading={busy} className="h-11 w-full bg-white text-black hover:bg-white/85">ارسال مجدد لینک</Button>
                <Button type="button" variant="ghost" onClick={() => { setView("form"); setMode("login"); }} className="w-full text-white/60 hover:bg-white/5 hover:text-white">بازگشت به ورود</Button>
              </div>
            ) : (
              <>
                <div className="mb-5 grid grid-cols-2 gap-1 rounded-md border border-white/10 bg-white/[0.04] p-1">
                  <button type="button" onClick={() => switchMode("login")} className={`h-9 rounded text-xs font-bold ${mode === "login" ? "bg-white text-black" : "text-white/50"}`}>ورود</button>
                  <button type="button" onClick={() => switchMode("register")} className={`h-9 rounded text-xs font-bold ${mode === "register" ? "bg-white text-black" : "text-white/50"}`}>ثبت‌نام</button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                  {mode === "register" && (
                    <>
                      <div className="space-y-1.5">
                        <Label htmlFor="unified-name" className="text-xs text-white/75">نام و نام خانوادگی</Label>
                        <Input id="unified-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="h-11 border-white/15 bg-white/[0.04] text-white" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="unified-username" className="text-xs text-white/75">نام کاربری انگلیسی</Label>
                        <Input id="unified-username" value={username} onChange={(e) => setUsername(e.target.value)} dir="ltr" autoComplete="username" className="h-11 border-white/15 bg-white/[0.04] text-left text-white" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="unified-email" className="text-xs text-white/75">ایمیل</Label>
                        <Input id="unified-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" autoComplete="email" className="h-11 border-white/15 bg-white/[0.04] text-left text-white" />
                      </div>
                    </>
                  )}

                  {mode === "login" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="unified-identifier" className="text-xs text-white/75">ایمیل یا نام کاربری</Label>
                      <Input id="unified-identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} dir="ltr" autoComplete="username" placeholder="name@example.com" className="h-11 border-white/15 bg-white/[0.04] text-left text-white placeholder:text-white/25" />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="unified-password" className="text-xs text-white/75">رمز عبور</Label>
                      {mode === "login" && <Link href="/auth/forgot-password" className="text-[11px] text-emerald-400 hover:underline">فراموشی رمز؟</Link>}
                    </div>
                    <div className="relative">
                      <Input id="unified-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="••••••••" className="h-11 border-white/15 bg-white/[0.04] pe-10 text-left text-white placeholder:text-white/25" />
                      <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute end-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white" aria-label={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}>
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  {mode === "register" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="unified-confirm" className="text-xs text-white/75">تکرار رمز عبور</Label>
                      <Input id="unified-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} dir="ltr" autoComplete="new-password" className="h-11 border-white/15 bg-white/[0.04] text-left text-white" />
                    </div>
                  )}

                  {error && <p className="rounded-md border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
                  <Button type="submit" className="h-11 w-full bg-white font-bold text-black hover:bg-white/85" loading={busy}>
                    {busy ? "در حال پردازش…" : mode === "login" ? "ورود" : "ایجاد حساب"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
