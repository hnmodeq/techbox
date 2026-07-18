"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth.provider";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

type Mode = "login" | "register";
type View = "form" | "verifySent";

/**
 * Auth modal with a proper Login / Register flow.
 *
 * - Register always collects a REAL email; the account is created but cannot
 *   log in until the email is verified (block-until-verified policy).
 * - Login accepts username OR email.
 * - If a login hits `email_not_verified` (or register returns `needsVerification`),
 *   the modal switches to a "verify sent" view with a resend option.
 *
 * Mounted in LayoutShell; opened anywhere via the `tb_open_auth` window event.
 */
export function AuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [view, setView] = useState<View>("form");
  const [pendingEmail, setPendingEmail] = useState("");

  // shared fields
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  // register-only fields
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [confirm, setConfirm] = useState("");

  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setView("form");
      setErrorMsg("");
    };
    window.addEventListener("tb_open_auth", handleOpen);
    return () => window.removeEventListener("tb_open_auth", handleOpen);
  }, []);

  const switchMode = (next: Mode) => {
    setMode(next);
    setView("form");
    setErrorMsg("");
  };

  const resendVerification = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (!pendingEmail) return;
    setBusy(true);
    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast.success(data.alreadyVerified ? "این ایمیل قبلاً تأیید شده است." : "لینک تأیید دوباره ارسال شد.");
        if (data.alreadyVerified) {
          setView("form");
          setMode("login");
        }
      } else {
        toast.error(data.message || "خطا در ارسال لینک تأیید");
      }
    } catch {
      toast.error("خطا در اتصال به سرور");
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      setErrorMsg("نام کاربری/ایمیل و رمز عبور را وارد کنید.");
      return;
    }
    setBusy(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: identifier.trim(), password }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setIsOpen(false);
        login(data.user);
        window.dispatchEvent(new CustomEvent("tb_auth_changed", { detail: data.user }));
        toast.success("خوش آمدید!");
        router.refresh();
        return;
      }

      if (data.error === "email_not_verified") {
        setPendingEmail(data.email || "");
        setView("verifySent");
        return;
      }

      setErrorMsg(data.message || "نام کاربری/ایمیل یا رمز عبور اشتباه است.");
    } catch {
      setErrorMsg("خطا در برقراری ارتباط با سرور");
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      setErrorMsg("لطفاً همه فیلدها را تکمیل کنید.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("رمز عبور و تکرار آن مطابقت ندارند.");
      return;
    }
    setBusy(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      const data = await res.json();

      // Bootstrap path (first user) returns a user + logs in immediately.
      if (res.ok && data.ok && data.user) {
        setIsOpen(false);
        login(data.user);
        window.dispatchEvent(new CustomEvent("tb_auth_changed", { detail: data.user }));
        toast.success("حساب مدیر با موفقیت ساخته شد!");
        router.refresh();
        return;
      }

      // Normal path: account created, must verify email before login.
      if (res.ok && data.needsVerification) {
        setPendingEmail(data.email || email.trim().toLowerCase());
        setView("verifySent");
        return;
      }

      setErrorMsg(data.error || data.message || "خطا در ایجاد حساب کاربری");
    } catch {
      setErrorMsg("خطا در برقراری ارتباط با سرور");
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") handleLogin();
    else handleRegister();
  };

  return (
    <>
      <Toaster dir="rtl" />
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden" dir="rtl">
          <div className="p-6 sm:p-8 space-y-5">
            {/* Header */}
            <DialogHeader className="text-center space-y-3">
              <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-[color-mix(in_oklch,var(--home)_10%,transparent)] border border-[color-mix(in_oklch,var(--home)_20%,transparent)] shadow-sm">
                <Image src="/logo.png" alt="لوگو تکباکس" width={44} height={44} className="object-contain" />
              </div>
              <DialogTitle className="text-xl font-black text-center">
                {view === "verifySent"
                  ? "تأیید ایمیل"
                  : mode === "login"
                    ? "ورود به تکباکس"
                    : "عضویت در تکباکس"}
              </DialogTitle>
              <DialogDescription className="text-xs leading-5 text-center max-w-xs mx-auto">
                {view === "verifySent"
                  ? "برای فعال‌سازی حساب، روی لینک ارسال‌شده در ایمیل خود کلیک کنید."
                  : mode === "login"
                    ? "با نام کاربری یا ایمیل و رمز عبور وارد شوید."
                    : "با ایمیل واقعی خود ثبت‌نام کنید؛ تأیید ایمیل برای ورود الزامی است."}
              </DialogDescription>
            </DialogHeader>

            {errorMsg && (
              <Card className="p-3 bg-destructive/10 border-destructive/30 text-center text-xs font-bold text-destructive">{errorMsg}</Card>
            )}

            {view === "verifySent" ? (
              <Card className="p-4 space-y-4 text-center">
                <div className="space-y-2">
                  <p className="text-sm font-bold">ایمیل تأیید ارسال شد</p>
                  {pendingEmail && (
                    <p className="text-xs text-muted-foreground break-all" dir="ltr">{pendingEmail}</p>
                  )}
                  <p className="text-xs text-muted-foreground leading-5">
                    صندوق ورودی (و پوشه هرزنامه) خود را بررسی کنید. لینک تا ۲۴ ساعت معتبر است.
                  </p>
                </div>
                <Button type="button" onClick={() => resendVerification()} disabled={busy} className="w-full">
                  {busy ? "در حال ارسال..." : "ارسال مجدد لینک تأیید"}
                </Button>
                <Button type="button" variant="link" size="xs" onClick={() => setView("form")} className="w-full">
                  بازگشت
                </Button>
              </Card>
            ) : (
              <>
                {/* Mode toggle */}
                <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-muted">
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className={`h-9 rounded-md text-xs font-bold transition-colors ${mode === "login" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                  >
                    ورود
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className={`h-9 rounded-md text-xs font-bold transition-colors ${mode === "register" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                  >
                    ثبت‌نام
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "register" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="auth-name" className="text-xs font-bold">نام نمایشی</Label>
                        <Input
                          id="auth-name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => { setName(e.target.value); setErrorMsg(""); }}
                          placeholder="نام و نام خانوادگی"
                          className="h-11 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="auth-username" className="text-xs font-bold">نام کاربری (انگلیسی)</Label>
                        <Input
                          id="auth-username"
                          type="text"
                          required
                          value={username}
                          onChange={(e) => { setUsername(e.target.value); setErrorMsg(""); }}
                          placeholder="username"
                          className="h-11 text-left font-mono text-sm ltr"
                          dir="ltr"
                          autoComplete="username"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="auth-identifier" className="text-xs font-bold">
                      {mode === "login" ? "ایمیل یا نام کاربری" : "ایمیل"}
                    </Label>
                    <Input
                      id="auth-identifier"
                      type={mode === "register" ? "email" : "text"}
                      required
                      value={mode === "register" ? email : identifier}
                      onChange={(e) => {
                        if (mode === "register") setEmail(e.target.value);
                        else setIdentifier(e.target.value);
                        setErrorMsg("");
                      }}
                      placeholder={mode === "register" ? "email@example.com" : "email@example.com یا username"}
                      className="h-11 text-left font-mono text-sm ltr"
                      dir="ltr"
                      autoComplete={mode === "register" ? "email" : "username"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="auth-password" className="text-xs font-bold">رمز عبور</Label>
                    <Input
                      id="auth-password"
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrorMsg(""); }}
                      placeholder="حداقل ۸ کاراکتر"
                      className="h-11 text-left font-mono text-sm"
                      dir="ltr"
                      autoComplete={mode === "register" ? "new-password" : "current-password"}
                    />
                  </div>

                  {mode === "register" && (
                    <div className="space-y-2">
                      <Label htmlFor="auth-confirm" className="text-xs font-bold">تکرار رمز عبور</Label>
                      <Input
                        id="auth-confirm"
                        type="password"
                        required
                        minLength={8}
                        value={confirm}
                        onChange={(e) => { setConfirm(e.target.value); setErrorMsg(""); }}
                        placeholder="تکرار رمز عبور"
                        className="h-11 text-left font-mono text-sm"
                        dir="ltr"
                        autoComplete="new-password"
                      />
                    </div>
                  )}

                  <Button type="submit" disabled={busy} className="w-full h-11 font-black">
                    {busy ? "در حال پردازش..." : mode === "login" ? "ورود" : "ایجاد حساب"}
                  </Button>
                </form>
              </>
            )}

            <Separator />

            <p className="text-[11px] text-muted-foreground text-center leading-4">با ورود به تکباکس، قوانین حریم خصوصی و استفاده از زیرساخت را می‌پذیرید.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
