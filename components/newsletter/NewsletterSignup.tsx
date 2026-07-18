"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const newsletterSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email("ایمیل نامعتبر").max(200),
});

type NewsletterValues = z.infer<typeof newsletterSchema>;

type NewsletterSignupProps = {
  compact?: boolean;
};

export function NewsletterSignup({ compact = false }: NewsletterSignupProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const form = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { name: "", email: "" },
  });

  const handleSubmit = async (values: NewsletterValues) => {
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email, name: values.name || undefined }),
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3 text-sm text-green-600">
        با موفقیت عضو شدید!
      </div>
    );
  }

  if (compact) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="email" placeholder="ایمیل خود را وارد کنید" dir="rtl" className="h-8 text-sm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="sm" className="w-full" loading={status === "loading"} disabled={status === "loading"}>
            {status === "loading" ? "..." : "عضویت"}
          </Button>
          {status === "error" && <p className="text-xs text-destructive">خطا در ثبت‌نام</p>}
        </form>
      </Form>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">نام (اختیاری)</FormLabel>
              <FormControl>
                <Input placeholder="نام شما" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">ایمیل</FormLabel>
              <FormControl>
                <Input type="email" placeholder="ایمیل خود را وارد کنید" dir="rtl" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" loading={status === "loading"} disabled={status === "loading"}>
          {status === "loading" ? "در حال ثبت..." : "عضویت در خبرنامه"}
        </Button>
        {status === "error" && <p className="text-sm text-destructive">خطا در ثبت‌نام</p>}
      </form>
    </Form>
  );
}

export default NewsletterSignup;
