"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import PageHeader from "@/components/effects/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/design/icons";

export default function AccountPage() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth form state (if not logged in)
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  // Profile form state (if logged in)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [job, setJob] = useState("");
  const [birthday, setBirthday] = useState("");
  const [avatar, setAvatar] = useState<string>("/assets/hooman.png");
  const [saveStatus, setSaveStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  // Password change state
  const [curPassword, setCurPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwdStatus, setPwdStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const loadUser = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setName(data.user.name || "");
          setEmail(data.user.email || "");
          setJob(data.user.job || "");
          setBirthday(data.user.birthday || "");
          setAvatar(data.user.avatar || "/assets/hooman.png");
          localStorage.setItem("tb_auth_user", JSON.stringify(data.user));
          setLoading(false);
          return;
        }
      }
    } catch {}
    setUser(null);
    localStorage.removeItem("tb_auth_user");
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!loginUsername.trim()) return;
    setAuthBusy(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername.trim(), password: loginPassword || "techbox123" })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        await loadUser();
      } else {
        setAuthError(data.error === "not found" ? "کاربری با این نام کاربری یافت نشد" : data.error === "invalid" ? "رمز عبور اشتباه است" : data.error || "خطا در ورود");
      }
    } catch {
      setAuthError("خطا در برقراری ارتباط با سرور Neon");
    } finally {
      setAuthBusy(false);
    }
  };

  const handleQuickLogin = async (username: string) => {
    setLoginUsername(username);
    setLoginPassword("techbox123");
    setAuthBusy(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: "techbox123" })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        await loadUser();
      } else {
        setAuthError("خطا در ورود سریع");
      }
    } finally {
      setAuthBusy(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName.trim(),
          username: regUsername.trim(),
          email: regEmail.trim(),
          password: regPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        await loadUser();
      } else {
        setAuthError(data.error || "خطا در ثبت‌نام");
      }
    } catch {
      setAuthError("خطا در برقراری ارتباط با سرور Neon");
    } finally {
      setAuthBusy(false);
    }
  };

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setAvatar(String(r.result));
    r.readAsDataURL(f);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, job, birthday, avatar })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setUser(data.user);
        localStorage.setItem("tb_auth_user", JSON.stringify(data.user));
        setSaveStatus({ ok: true, msg: "پروفایل با موفقیت در پایگاه داده Neon ذخیره شد ✓" });
      } else {
        setSaveStatus({ ok: false, msg: data.error || "خطا در ذخیره پروفایل" });
      }
    } catch {
      setSaveStatus({ ok: false, msg: "خطا در اتصال به سرور" });
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdStatus(null);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: curPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setPwdStatus({ ok: true, msg: data.message });
        setCurPassword("");
        setNewPassword("");
      } else {
        setPwdStatus({ ok: false, msg: data.error || "خطا در تغییر رمز عبور" });
      }
    } catch {
      setPwdStatus({ ok: false, msg: "خطا در اتصال به سرور" });
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("tb_auth_user");
    setUser(null);
  };

  if (loading) {
    return (
      <main className="max-w-md mx-auto px-5 py-20 text-center" dir="rtl">
        <div className="card p-8 space-y-4 animate-pulse">
          <p className="tb-text-md text-[var(--tb-fg-muted)]">در حال بررسی اطلاعات حساب در Neon...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-xl mx-auto px-4 py-12" dir="rtl">
        <div className="card p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="tb-text-big-title text-[var(--tb-primary)]">ورود و عضویت تکباکس</h1>
            <p className="tb-text-sm text-[var(--tb-fg-muted)]">
              برای ثبت دیدگاه، پسندیدن مطالب (لایک) و مدیریت پروفایل وارد حساب خود شوید.
            </p>
          </div>

          <div className="flex rounded-[var(--tb-radius-lg)] bg-[var(--tb-bg-secondary)] p-1">
            <button
              type="button"
              onClick={() => { setTab("login"); setAuthError(""); }}
              className={`flex-1 py-2 text-center rounded-[var(--tb-radius-md)] transition-colors tb-text-sm ${tab === "login" ? "bg-[var(--tb-primary)] text-white shadow-[var(--tb-shadow-sm)]" : "text-[var(--tb-fg-muted)] hover:text-[var(--tb-fg-primary)]"}`}
            >
              ورود به حساب
            </button>
            <button
              type="button"
              onClick={() => { setTab("register"); setAuthError(""); }}
              className={`flex-1 py-2 text-center rounded-[var(--tb-radius-md)] transition-colors tb-text-sm ${tab === "register" ? "bg-[var(--tb-primary)] text-white shadow-[var(--tb-shadow-sm)]" : "text-[var(--tb-fg-muted)] hover:text-[var(--tb-fg-primary)]"}`}
            >
              ثبت‌نام جدید
            </button>
          </div>

          {authError && (
            <div className="rounded-[var(--tb-radius-md)] bg-[var(--tb-danger)]/10 border border-[var(--tb-danger)]/30 p-3 text-center tb-text-sm text-[var(--tb-danger)]">
              {authError}
            </div>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block tb-text-sm text-[var(--tb-fg-muted)] mb-1">نام کاربری</label>
                <input
                  required
                  value={loginUsername}
                  onChange={e => { setLoginUsername(e.target.value); setAuthError(""); }}
                  placeholder="مثلا: admin یا sara یا nima"
                  className="input w-full"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block tb-text-sm text-[var(--tb-fg-muted)] mb-1">رمز عبور</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => { setLoginPassword(e.target.value); setAuthError(""); }}
                  placeholder="پیش‌فرض: techbox123"
                  className="input w-full"
                  dir="ltr"
                />
              </div>
              <Button disabled={authBusy} className="w-full justify-center">
                {authBusy ? "در حال ورود..." : "ورود به حساب تکباکس"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block tb-text-sm text-[var(--tb-fg-muted)] mb-1">نام و نام خانوادگی</label>
                <input
                  required
                  value={regName}
                  onChange={e => { setRegName(e.target.value); setAuthError(""); }}
                  placeholder="مثلا: علیرضا محمدی"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block tb-text-sm text-[var(--tb-fg-muted)] mb-1">نام کاربری انگلیسی</label>
                <input
                  required
                  value={regUsername}
                  onChange={e => { setRegUsername(e.target.value); setAuthError(""); }}
                  placeholder="alireza_m"
                  className="input w-full"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block tb-text-sm text-[var(--tb-fg-muted)] mb-1">ایمیل معتبر</label>
                <input
                  required
                  type="email"
                  value={regEmail}
                  onChange={e => { setRegEmail(e.target.value); setAuthError(""); }}
                  placeholder="alireza@example.com"
                  className="input w-full"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block tb-text-sm text-[var(--tb-fg-muted)] mb-1">رمز عبور انتخابی</label>
                <input
                  required
                  type="password"
                  minLength={5}
                  value={regPassword}
                  onChange={e => { setRegPassword(e.target.value); setAuthError(""); }}
                  placeholder="حداقل ۵ کاراکتر"
                  className="input w-full"
                  dir="ltr"
                />
              </div>
              <Button disabled={authBusy} className="w-full justify-center">
                {authBusy ? "در حال ثبت‌نام در Neon..." : "ایجاد حساب کاربری جدید"}
              </Button>
            </form>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10" dir="rtl">
      <PageHeader
        colorVar="--tb-account"
        title="پروفایل و حساب کاربری واقعی"
        titleClassName="text-[var(--tb-account)]"
      >
        <div className="flex items-center gap-2 tb-text-sm text-[var(--tb-fg-muted)]">
          <Badge variant="info">{user.roleFa || (user.role === "super_admin" ? "مدیر کل" : "کاربر")}</Badge>
          <span>•</span>
          <span>شناسه Neon: <span className="font-mono text-xs">{user.id}</span></span>
        </div>
      </PageHeader>

      <form onSubmit={saveProfile} className="grid lg:grid-cols-3 gap-6 mt-6">
        {/* avatar card */}
        <div className="card p-6 text-center space-y-4 h-fit">
          <div className="relative w-32 h-32 mx-auto">
            {avatar ? (
              <Image
                src={avatar}
                width={128}
                height={128}
                className="h-32 w-32 rounded-[var(--tb-radius-full)] object-cover ring-2 ring-[var(--tb-border)] shadow-[var(--tb-shadow-md)]"
                alt={user?.name || "کاربر"}
              />
            ) : (
              <div className="h-32 w-32 rounded-[var(--tb-radius-full)] bg-[var(--tb-bg-secondary)] border-2 border-[var(--tb-border)] flex items-center justify-center text-[var(--tb-fg-muted)] shadow-[var(--tb-shadow-md)]">
                <Icon name="user" size={48} />
              </div>
            )}
            <label className="absolute bottom-1 left-1 cursor-pointer rounded-[var(--tb-radius-full)] bg-[var(--tb-primary)] px-2.5 py-1 tb-text-sm text-white shadow-[var(--tb-shadow-sm)] hover:opacity-90">
              تغییر تصویر
              <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
            </label>
          </div>
          <div>
            <div className="tb-text-lg ">{name}</div>
            <div className="tb-text-sm text-[var(--tb-fg-muted)] font-mono" dir="ltr">@{user.username}</div>
          </div>
          {job && <div className="tb-text-sm rounded-[var(--tb-radius-md)] bg-[var(--tb-bg-secondary)] py-1.5 px-3">{job}</div>}
          <Button
            type="button"
            variant="ghost"
            onClick={handleLogout}
            className="w-full text-[var(--tb-danger)] hover:bg-[var(--tb-danger)]/10 tb-text-sm mt-4"
          >
            خروج از حساب کاربری
          </Button>
        </div>

        {/* profile form */}
        <div className="lg:col-span-2 card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--tb-border)] pb-3">
            <h3 className="tb-text-lg ">ویرایش مشخصات در Neon PostgreSQL</h3>
            <Badge variant="secondary">ذخیره مستقیم در دیتابیس</Badge>
          </div>

          {saveStatus && (
            <div className={`rounded-[var(--tb-radius-md)] p-3 text-center tb-text-sm ${saveStatus.ok ? "bg-[var(--tb-success)]/15 text-[var(--tb-success)] border border-[var(--tb-success)]/30" : "bg-[var(--tb-danger)]/15 text-[var(--tb-danger)] border border-[var(--tb-danger)]/30"}`}>
              {saveStatus.msg}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block tb-text-sm text-[var(--tb-fg-muted)] mb-1.5">نام و نام خانوادگی</label>
              <input value={name} onChange={e => setName(e.target.value)} className="input w-full" />
            </div>
            <div>
              <label className="block tb-text-sm text-[var(--tb-fg-muted)] mb-1.5">نام کاربری (غیرقابل تغییر)</label>
              <input value={user.username} disabled className="input w-full bg-[var(--tb-bg-secondary)] opacity-70 cursor-not-allowed" dir="ltr" />
            </div>
            <div>
              <label className="block tb-text-sm text-[var(--tb-fg-muted)] mb-1.5">ایمیل</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input w-full" dir="ltr" />
            </div>
            <div>
              <label className="block tb-text-sm text-[var(--tb-fg-muted)] mb-1.5">سمت شغلی یا تخصص</label>
              <input value={job} onChange={e => setJob(e.target.value)} placeholder="مثلا: کارشناس زیرساخت شبکه" className="input w-full" />
            </div>
            <div className="sm:col-span-2">
              <label className="block tb-text-sm text-[var(--tb-fg-muted)] mb-1.5">تاریخ تولد</label>
              <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} className="input sm:w-1/2" />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit">ذخیره تغییرات در دیتابیس</Button>
          </div>

          {/* password section */}
          <div className="border-t border-[var(--tb-border)] pt-6 space-y-4">
            <h4 className="tb-text-md ">تغییر رمز عبور واقعی</h4>
            {pwdStatus && (
              <div className={`rounded-[var(--tb-radius-md)] p-3 text-center tb-text-sm ${pwdStatus.ok ? "bg-[var(--tb-success)]/15 text-[var(--tb-success)]" : "bg-[var(--tb-danger)]/15 text-[var(--tb-danger)]"}`}>
                {pwdStatus.msg}
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                type="password"
                placeholder="رمز عبور فعلی"
                value={curPassword}
                onChange={e => setCurPassword(e.target.value)}
                className="input"
                dir="ltr"
              />
              <input
                type="password"
                placeholder="رمز عبور جدید (حداقل ۵ حرف)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="input"
                dir="ltr"
              />
            </div>
            <div className="flex justify-end">
              <Button type="button" variant="secondary" size="sm" onClick={changePassword}>
                به‌روزرسانی رمز عبور
              </Button>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
