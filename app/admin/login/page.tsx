"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/providers/auth.provider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

const loginSchema = z.object({
  username: z.string().min(2, "نام کاربری حداقل ۲ کاراکتر").max(100),
  password: z.string().min(6, "رمز حداقل ۶ کاراکتر").max(100),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    setServerError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: values.username.trim(), password: values.password }),
      });
      const data = await response.json();
      if (!response.ok || !data.user) {
        setServerError(data.message || "اطلاعات ورود صحیح نیست.");
        return;
      }
      await login();
      toast.success("ورود موفق");
      router.push("/admin");
      router.refresh();
    } catch {
      setServerError("ارتباط امن با سرور برقرار نشد.");
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
              بازگشت به سایت
              <ArrowLeft className="size-3.5" />
            </Link>
            <div className="pb-16">
              <Image src="/logo.png" alt="تکباکس" width={54} height={54} className="mb-6 size-14 object-contain" />
              <p className="max-w-xs text-3xl font-black leading-[1.45]">مدیریت زیرساخت دانشی تکباکس</p>
              <p className="mt-3 max-w-sm text-sm leading-7 text-white/60">محتوا، فروشگاه، جامعه و سرویس‌های فناوری اطلاعات را از یک پنل امن مدیریت کنید.</p>
            </div>
          </div>
        </section>

        <section className="relative flex min-h-svh items-center justify-center px-5 py-16" dir="rtl">
          <Link href="/" className="absolute end-5 top-5 inline-flex items-center gap-2 text-xs text-white/55 transition-colors hover:text-white lg:hidden">
            بازگشت به سایت
            <ArrowLeft className="size-3.5" />
          </Link>
          <div className="w-full max-w-[360px]">
            <div className="mb-8 text-center">
              <Image src="/logo.png" alt="تکباکس" width={48} height={48} className="mx-auto mb-5 size-12 object-contain" />
              <h1 className="text-2xl font-black">ورود به پنل تکباکس</h1>
              <p className="mt-2 text-xs text-white/45">با حساب مدیریتی خود ادامه دهید</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-white/75">ایمیل یا نام کاربری</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="name@example.com"
                          dir="ltr"
                          autoComplete="username"
                          className="h-11 border-white/15 bg-white/[0.04] text-left text-white placeholder:text-white/25 focus-visible:border-white/35"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-xs text-white/75">رمز عبور</FormLabel>
                        <Link href="/auth/forgot-password" className="text-[11px] text-emerald-400 hover:underline">فراموشی رمز؟</Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            dir="ltr"
                            autoComplete="current-password"
                            className="h-11 border-white/15 bg-white/[0.04] pe-10 text-left text-white placeholder:text-white/25 focus-visible:border-white/35"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((value) => !value)}
                            className="absolute end-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                            aria-label={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}
                          >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {serverError && <p className="rounded-md border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300">{serverError}</p>}

                <Button
                  type="submit"
                  className="h-11 w-full bg-white font-bold text-black hover:bg-white/85"
                  loading={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "در حال ورود…" : "ورود"}
                </Button>
              </form>
            </Form>

            <p className="mt-7 text-center text-[11px] leading-6 text-white/35">ورود فقط برای اعضای دارای دسترسی مدیریت مجاز است.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
