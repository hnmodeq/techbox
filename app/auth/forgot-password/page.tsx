"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { pageMetadata } from "@/lib/seo";

const schema = z.object({
  email: z.string().email("ایمیل نامعتبر"),
});

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setStatus("idle");
    setMessage("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus("sent");
        setMessage(data.message || "لینک بازیابی رمز عبور به ایمیل شما ارسال شد.");
      } else {
        setStatus("error");
        setMessage(data.error || data.message || "خطا در ارسال");
      }
    } catch {
      setStatus("error");
      setMessage("خطا در ارتباط با سرور");
    }
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-10" dir="rtl">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">بازیابی رمز عبور</CardTitle>
          <CardDescription>ایمیل حساب خود را وارد کنید تا لینک بازیابی برایتان ارسال شود.</CardDescription>
        </CardHeader>

        {status === "sent" ? (
          <CardContent className="space-y-4">
            <div className="rounded-md bg-green-500/10 border border-green-500/30 p-4 text-center space-y-2">
              <p className="text-sm font-bold text-green-600">ایمیل ارسال شد</p>
              <p className="text-xs text-muted-foreground">{message}</p>
              <p className="text-xs text-muted-foreground">صندوق ورودی و هرزنامه خود را بررسی کنید. لینک تا ۱ ساعت معتبر است.</p>
            </div>
            <Link href="/account">
              <Button variant="outline" className="w-full">بازگشت به ورود</Button>
            </Link>
          </CardContent>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ایمیل</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" dir="ltr" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {status === "error" && <p className="text-sm text-destructive">{message}</p>}
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "در حال ارسال..." : "ارسال لینک بازیابی"}
                </Button>
                <Link href="/account" className="text-xs text-muted-foreground hover:text-foreground">
                  بازگشت به ورود
                </Link>
              </CardFooter>
            </form>
          </Form>
        )}
      </Card>
    </main>
  );
}
