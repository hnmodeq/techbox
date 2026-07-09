"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Icon } from "@/design/icons";
import { useAuth } from "@/providers/auth.provider";

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

  if (!isOpen) return null;

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
        router.refresh();
        return;
      }

      // If password was incorrect for existing user
      if (loginData.error === "invalid") {
        setErrorMsg("رمز عبور وارد شده برای این حساب اشتباه است.");
        setBusy(false);
        return;
      }

      // 2. If user not found (status 404), register automatically with empty avatar
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-0 duration-200" dir="rtl">
      <div className="relative w-full max-w-[440px] rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--modal-background)] p-6 sm:p-8 shadow-[var(--shadow-size)] text-[var(--primary-text)]">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute top-4 left-4 h-8 w-8 rounded-full flex items-center justify-center paragraph-color hover:bg-[var(--card-background)] hover:text-[var(--primary-text)] transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto relative flex h-14 w-14 items-center justify-center rounded-[var(--corner-radius)] bg-[var(--home)]/10 border-[length:var(--border-size)] border-[var(--home)]/30 p-2 shadow-[var(--shadow-size)]">
            <Image src="/logo.png" alt="لوگو تکباکس" width={44} height={44} className="object-contain" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            ورود و عضویت در تکباکس
          </h2>
          <p className="text-xs sm:text-sm paragraph-color leading-5 max-w-xs mx-auto">
            اگر حساب ندارید، با وارد کردن نام کاربری و رمز عبور، حسابتان به صورت خودکار ایجاد می‌شود.
          </p>
        </div>

        {errorMsg && (
          <div className="mt-5 rounded-[var(--corner-radius)] bg-red-950/40 border-[length:var(--border-size)] border-red-800/80 p-3 text-center text-xs sm:text-sm text-red-300 font-bold animate-shake">
            {errorMsg}
          </div>
        )}

        {forgotOpen ? (
          <div className="mt-6 space-y-4 rounded-[var(--corner-radius)] bg-[var(--card-background)] p-4 border-[length:var(--border-size)] border-[var(--border-color)] text-center">
            <h4 className="font-bold text-sm text-[var(--warning)]">بازیابی رمز عبور</h4>
            <p className="text-xs paragraph-color leading-5">
              برای تغییر یا بازیابی رمز عبور حساب کاربری خود، لطفاً با ایمیل پشتیبانی یا ادمین سیستم تماس بگیرید.
            </p>
            <button
              type="button"
              onClick={() => setForgotOpen(false)}
              className="w-full py-2 rounded-[var(--corner-radius)] bg-[var(--home)] text-white text-xs font-bold hover:opacity-90"
            >
              بازگشت به ورود
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-[var(--primary-text)] mb-1.5">
                ایمیل یا نام کاربری انگلیسی
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setErrorMsg(""); }}
                placeholder="email@example.com یا username"
                className="input w-full !h-11 text-left font-mono text-sm"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--primary-text)] mb-1.5">
                رمز عبور
              </label>
              <input
                type="password"
                required
                minLength={5}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrorMsg(""); }}
                placeholder="••••••••"
                className="input w-full !h-11 text-left font-mono text-sm"
                dir="ltr"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer paragraph-color select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[var(--border-color)] bg-[var(--card-background)] text-[var(--home)] focus:ring-0 h-4 w-4"
                />
                <span>مرا به خاطر بسپار</span>
              </label>

              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="font-bold text-[var(--home)] hover:underline cursor-pointer"
              >
                فراموشی رمز عبور؟
              </button>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full !h-11 rounded-[var(--corner-radius)] bg-[var(--home)] text-white font-black text-sm shadow-[var(--shadow-size)] hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
            >
              {busy ? "در حال پردازش..." : "ورود یا شروع عضویت"}
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t-[length:var(--border-size)] border-[var(--border-color)]/60 text-center">
          <p className="text-[11px] paragraph-color leading-4">
            با ورود به تکباکس، قوانین حریم خصوصی و استفاده از زیرساخت را می‌پذیرید.
          </p>
        </div>
      </div>
    </div>
  );
}
