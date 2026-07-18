"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import PageHeader from "@/components/effects/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@/design/icons";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { AccountProfileTabs } from "@/components/profile/AccountProfileTabs";

const loginSchema = z.object({
  username: z.string().min(2),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(2, "نام حداقل ۲").max(100),
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8, "حداقل ۸ کاراکتر"),
});

const profileSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  job: z.string().max(100).optional(),
  birthday: z.string().max(20).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(5, "حداقل ۵"),
});

export default function AccountPage() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [avatar, setAvatar] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [pwdStatus, setPwdStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);
  const [resendBusy, setResendBusy] = useState(false);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", username: "", email: "", password: "" },
  });
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "", job: "", birthday: "" },
  });
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  const loadUser = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setAvatar(data.user.avatar ?? "");
          profileForm.reset({
            name: data.user.name || "",
            email: data.user.email || "",
            job: data.user.job || "",
            birthday: data.user.birthday || "",
          });
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

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    setAuthBusy(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: values.username.trim(), password: values.password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        await loadUser();
        toast.success("ورود موفق");
      } else if (data.error === "email_not_verified") {
        setAuthError("");
        setVerifyEmail(data.email || values.username);
      } else {
        setAuthError(data.message || data.error || "خطا در ورود");
      }
    } catch {
      setAuthError("خطا در ارتباط با سرور Neon");
    } finally {
      setAuthBusy(false);
    }
  };

  const handleRegister = async (values: z.infer<typeof registerSchema>) => {
    setAuthBusy(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (res.ok && data.ok && data.user) {
        await loadUser();
        toast.success("ثبت‌نام موفق");
      } else if (res.ok && data.needsVerification) {
        setAuthError("");
        setVerifyEmail(data.email || values.email);
      } else {
        setAuthError(data.error || data.message || "خطا در ثبت‌نام");
      }
    } catch {
      setAuthError("خطا در ارتباط با سرور Neon");
    } finally {
      setAuthBusy(false);
    }
  };

  const resendVerify = async () => {
    if (!verifyEmail) return;
    setResendBusy(true);
    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifyEmail }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast.success(data.alreadyVerified ? "این ایمیل قبلاً تأیید شده است." : "لینک تأیید دوباره ارسال شد.");
        if (data.alreadyVerified) setVerifyEmail(null);
      } else {
        toast.error(data.message || "خطا در ارسال لینک تأیید");
      }
    } catch {
      toast.error("خطا در اتصال به سرور");
    } finally {
      setResendBusy(false);
    }
  };

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setAvatar(String(r.result));
    r.readAsDataURL(f);
  };

  const saveProfile = async (values: z.infer<typeof profileSchema>) => {
    setSaveStatus(null);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, avatar }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setUser(data.user);
        localStorage.setItem("tb_auth_user", JSON.stringify(data.user));
        setSaveStatus({ ok: true, msg: "پروفایل ذخیره شد ✓" });
        toast.success("پروفایل ذخیره شد");
      } else {
        setSaveStatus({ ok: false, msg: data.error || "خطا در ذخیره" });
      }
    } catch {
      setSaveStatus({ ok: false, msg: "خطا در اتصال" });
    }
  };

  const changePassword = async (values: z.infer<typeof passwordSchema>) => {
    setPwdStatus(null);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setPwdStatus({ ok: true, msg: data.message });
        passwordForm.reset();
        toast.success("رمز عبور تغییر کرد");
      } else {
        setPwdStatus({ ok: false, msg: data.error || "خطا" });
      }
    } catch {
      setPwdStatus({ ok: false, msg: "خطا در اتصال" });
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
        <Card className="p-8 animate-pulse">
          <p className="text-sm text-muted-foreground">در حال بررسی اطلاعات حساب در Neon...</p>
        </Card>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-xl mx-auto px-4 py-12" dir="rtl">
        <Toaster dir="rtl" />
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-xl font-extrabold text-[var(--home)]">ورود و عضویت تکباکس</h1>
            <p className="text-sm text-muted-foreground">برای ثبت دیدگاه، لایک و مدیریت پروفایل وارد شوید.</p>
          </div>

          {verifyEmail ? (
            <div className="space-y-4">
              <div className="rounded-md bg-green-500/10 border border-green-500/30 p-4 text-center space-y-2">
                <p className="text-sm font-bold">ایمیل تأیید ارسال شد</p>
                <p className="text-xs text-muted-foreground break-all" dir="ltr">{verifyEmail}</p>
                <p className="text-xs text-muted-foreground leading-5">صندوق ورودی و هرزنامه را بررسی کنید. لینک تا ۲۴ ساعت معتبر است.</p>
              </div>
              <Button type="button" className="w-full" disabled={resendBusy} loading={resendBusy} onClick={resendVerify}>
                ارسال مجدد لینک تأیید
              </Button>
              <Button type="button" variant="link" className="w-full" onClick={() => { setVerifyEmail(null); setTab("login"); }}>
                بازگشت به ورود
              </Button>
            </div>
          ) : (
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="login">ورود</TabsTrigger>
                <TabsTrigger value="register">ثبت‌نام</TabsTrigger>
              </TabsList>
              {authError && <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3 text-center text-sm text-destructive">{authError}</div>}

              <TabsContent value="login" className="space-y-4 pt-4">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نام کاربری یا ایمیل</FormLabel>
                          <FormControl>
                            <Input placeholder="مثلا admin یا email@example.com" dir="ltr" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رمز عبور</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="رمز عبور" dir="ltr" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button disabled={authBusy} type="submit" className="w-full" loading={authBusy}>
                      ورود
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 pt-4">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نام و نام خانوادگی</FormLabel>
                          <FormControl>
                            <Input placeholder="علیرضا محمدی" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نام کاربری انگلیسی</FormLabel>
                          <FormControl>
                            <Input placeholder="alireza_m" dir="ltr" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ایمیل</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="alireza@example.com" dir="ltr" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رمز عبور</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="حداقل ۸ کاراکتر" dir="ltr" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button disabled={authBusy} type="submit" className="w-full" loading={authBusy}>
                      ایجاد حساب
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          )}
        </Card>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10" dir="rtl">
      <Toaster dir="rtl" />
      <PageHeader colorVar="--account" title="پروفایل و حساب کاربری" titleClassName="text-[var(--account)]">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge>{user.roleFa || (user.role === "super_admin" ? "مدیر کل" : "کاربر")}</Badge>
          <span>•</span>
          <span className="font-mono text-xs">Neon: {user.id.slice(0, 8)}…</span>
        </div>
      </PageHeader>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <Card className="p-6 text-center space-y-4 h-fit">
          <div className="relative w-32 h-32 mx-auto">
            {avatar && avatar !== "/assets/hooman.png" ? (
              <Image src={avatar} width={128} height={128} className="h-32 w-32 rounded-xl object-cover ring-2 ring-border shadow" alt={user?.name || "کاربر"} />
            ) : (
              <div className="h-32 w-32 rounded-xl bg-muted border flex items-center justify-center text-muted-foreground">
                <Icon name="user" size={48} />
              </div>
            )}
            <label className="absolute bottom-1 left-1 cursor-pointer rounded-md bg-primary text-primary-foreground px-2.5 py-1 text-xs shadow hover:opacity-90">
              تغییر تصویر
              <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
            </label>
          </div>
          <div>
            <div className="font-bold">{profileForm.watch("name") || user.name}</div>
            <div className="font-mono text-xs text-muted-foreground" dir="ltr">
              @{user.username}
            </div>
          </div>
          <Button type="button" variant="ghost" onClick={handleLogout} className="w-full text-destructive hover:bg-destructive/10">
            خروج از حساب
          </Button>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <AccountProfileTabs profileEditor={
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-base">ویرایش پروفایل</CardTitle>
              </CardHeader>
            {saveStatus && (
              <div className={`rounded-md p-3 text-center text-sm mb-4 ${saveStatus.ok ? "bg-green-500/15 text-green-600 border border-green-500/30" : "bg-destructive/15 text-destructive border border-destructive/30"}`}>
                {saveStatus.msg}
              </div>
            )}
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نام و نام خانوادگی</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <FormLabel>نام کاربری (غیرقابل تغییر)</FormLabel>
                    <Input value={user.username} disabled dir="ltr" className="opacity-70" />
                  </div>
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ایمیل</FormLabel>
                        <FormControl>
                          <Input type="email" dir="ltr" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="job"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مهارت شغلی</FormLabel>
                        <FormControl>
                          <Input placeholder="مثلا کارشناس زیرساخت" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" loading={profileForm.formState.isSubmitting}>
                    ذخیره
                  </Button>
                </div>
              </form>
            </Form>

            <Separator className="my-6" />

            <h4 className="font-semibold mb-4">تغییر رمز عبور</h4>
            {pwdStatus && (
              <div className={`rounded-md p-3 text-center text-sm mb-4 ${pwdStatus.ok ? "bg-green-500/15 text-green-600" : "bg-destructive/15 text-destructive"}`}>
                {pwdStatus.msg}
              </div>
            )}
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(changePassword)} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رمز فعلی</FormLabel>
                        <FormControl>
                          <Input type="password" dir="ltr" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رمز جدید</FormLabel>
                        <FormControl>
                          <Input type="password" dir="ltr" placeholder="حداقل ۵ حرف" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="secondary" size="sm" loading={passwordForm.formState.isSubmitting}>
                    به‌روزرسانی رمز
                  </Button>
                </div>
              </form>
            </Form>
            </Card>
          }
          />
        </div>
      </div>
    </main>
  );
}
