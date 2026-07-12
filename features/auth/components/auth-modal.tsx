"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth.provider";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

// Rebuilt with shadcn: Dialog + Input + Checkbox + Button + Label + Separator + Card
export function AuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setErrorMsg("");
    };
    window.addEventListener("tb_open_auth", handleOpen);
    return () => window.removeEventListener("tb_open_auth", handleOpen);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;
    setBusy(true);
    setErrorMsg("");

    try {
      // 1. Try login first
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: identifier.trim().toLowerCase(), password }),
      });
      const loginData = await loginRes.json();

      if (loginRes.ok && loginData.ok) {
        setIsOpen(false);
        login(loginData.user);
        window.dispatchEvent(new CustomEvent("tb_auth_changed", { detail: loginData.user }));
        toast.success("خوش آمدید!");
        router.refresh();
        return;
      }

      if (loginData.error === "invalid") {
        setErrorMsg("رمز عبور وارد شده برای این حساب اشتباه است.");
        setBusy(false);
        return;
      }

      // 2. If user not found, register automatically
      if (loginRes.status === 404 || loginData.error === "not found") {
        const cleanUser = identifier.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 30) || `user_${Date.now().toString(36)}`;
        const cleanEmail = identifier.includes("@") ? identifier.trim().toLowerCase() : `${cleanUser}@techbox.ir`;
        const cleanName = identifier.includes("@") ? identifier.split("@")[0] : identifier.trim();

        const regRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: cleanName,
            username: cleanUser,
            email: cleanEmail,
            password,
          }),
        });
        const regData = await regRes.json();

        if (regRes.ok && regData.ok) {
          setIsOpen(false);
          login(regData.user);
          window.dispatchEvent(new CustomEvent("tb_auth_changed", { detail: regData.user }));
          toast.success("حساب شما ساخته شد!");
          router.refresh();
          return;
        } else {
          setErrorMsg(regData.error || "خطا در ایجاد حساب کاربری");
        }
      } else {
        setErrorMsg(loginData.error || "خطا در ورود به سیستم");
      }
    } catch {
      setErrorMsg("خطا در برقراری ارتباط با سرور");
    } finally {
      setBusy(false);
    }
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
              <DialogTitle className="text-xl font-black text-center">ورود و عضویت در تکباکس</DialogTitle>
              <DialogDescription className="text-xs leading-5 text-center max-w-xs mx-auto">
                اگر حساب ندارید، با وارد کردن نام کاربری و رمز عبور، حسابتان به صورت خودکار ایجاد می‌شود.
              </DialogDescription>
            </DialogHeader>

            {errorMsg && (
              <Card className="p-3 bg-destructive/10 border-destructive/30 text-center text-xs font-bold text-destructive">{errorMsg}</Card>
            )}

            {forgotOpen ? (
              <Card className="p-4 space-y-3 text-center">
                <h4 className="font-bold text-sm text-[var(--warning)]">بازیابی رمز عبور</h4>
                <p className="text-xs text-muted-foreground leading-5">برای تغییر یا بازیابی رمز عبور، با ایمیل پشتیبانی یا ادمین سیستم تماس بگیرید.</p>
                <Button type="button" onClick={() => setForgotOpen(false)} className="w-full">
                  بازگشت به ورود
                </Button>
              </Card>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="auth-identifier" className="text-xs font-bold">
                    ایمیل یا نام کاربری انگلیسی
                  </Label>
                  <Input
                    id="auth-identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setErrorMsg("");
                    }}
                    placeholder="email@example.com یا username"
                    className="h-11 text-left font-mono text-sm ltr"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auth-password" className="text-xs font-bold">
                    رمز عبور
                  </Label>
                  <Input
                    id="auth-password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMsg("");
                    }}
                    placeholder="••••••••"
                    className="h-11 text-left font-mono text-sm"
                    dir="ltr"
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Checkbox id="remember" checked={rememberMe} onCheckedChange={(v) => setRememberMe(!!v)} />
                    <Label htmlFor="remember" className="text-xs cursor-pointer">
                      مرا به خاطر بسپار
                    </Label>
                  </div>
                  <Button type="button" variant="link" size="xs" onClick={() => setForgotOpen(true)} className="h-auto p-0 text-xs font-bold text-[var(--home)]">
                    فراموشی رمز عبور؟
                  </Button>
                </div>

                <Button type="submit" disabled={busy} className="w-full h-11 font-black">
                  {busy ? "در حال پردازش..." : "ورود یا شروع عضویت"}
                </Button>
              </form>
            )}

            <Separator />

            <p className="text-[11px] text-muted-foreground text-center leading-4">با ورود به تکباکس، قوانین حریم خصوصی و استفاده از زیرساخت را می‌پذیرید.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
