"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const resetSchema = z.object({
  newPassword: z.string().min(8, "حداقل ۸ کاراکتر"),
  confirmPassword: z.string().min(8),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "رمز عبور و تکرار مطابقت ندارند",
  path: ["confirmPassword"],
});

type ResetValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const form = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  if (!token || !email) {
    return (
      <main className="max-w-md mx-auto px-4 py-20 space-y-4" dir="rtl">
        <Card className="p-8 space-y-4 text-center">
          <CardTitle>لینک نامعتبر</CardTitle>
          <CardDescription>لینک بازیابی رمز عبور معتبر نیست یا ناقص است. لطفاً دوباره درخواست بازیابی بدهید.</CardDescription>
          <ButtonLink href="/account" className="mt-4">بازگشت به حساب کاربری</ButtonLink>
        </Card>
      </main>
    );
  }

  const handleSubmit = async (values: ResetValues) => {
    setMessage("");
    setStatus("loading");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword: values.newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus("success");
        setMessage("رمز عبور با موفقیت تغییر کرد. اکنون می‌توانید وارد شوید.");
      } else {
        setStatus("error");
        setMessage(data.error || "خطا در تغییر رمز عبور. لینک ممکن است منقضی شده باشد.");
      }
    } catch {
      setStatus("error");
      setMessage("خطا در اتصال به سرور.");
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-20 space-y-6" dir="rtl">
      <Card className="p-6 sm:p-8 space-y-6">
        <CardHeader className="p-0 text-center">
          <CardTitle>بازیابی رمز عبور</CardTitle>
          <CardDescription>رمز عبور جدید خود را وارد کنید.</CardDescription>
        </CardHeader>

        {status === "success" ? (
          <Card className="p-4 bg-green-500/10 border-green-500/30 text-center space-y-3">
            <p className="text-sm text-green-600">{message}</p>
            <ButtonLink href="/account" className="w-full">ورود به حساب</ButtonLink>
          </Card>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رمز عبور جدید</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="حداقل ۸ کاراکتر" dir="ltr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تکرار رمز عبور</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="تکرار رمز عبور" dir="ltr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {message && <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3 text-center text-sm text-destructive">{message}</div>}

              <Button type="submit" disabled={status === "loading"} loading={form.formState.isSubmitting} className="w-full">
                {status === "loading" ? "در حال تغییر..." : "تغییر رمز عبور"}
              </Button>
            </form>
          </Form>
        )}
      </Card>
    </main>
  );
}
