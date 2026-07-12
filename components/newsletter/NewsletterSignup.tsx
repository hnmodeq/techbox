"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

const newsletterSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email("ایمیل نامعتبر").max(200),
});

type NewsletterValues = z.infer<typeof newsletterSchema>;

export default function NewsletterSignup() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

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
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "با موفقیت عضو شدید!");
        form.reset();
      } else {
        setStatus("error");
        setMessage(data.error || "خطا در ثبت‌نام");
      }
    } catch {
      setStatus("error");
      setMessage("خطا در ارتباط با سرور");
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          خبرنامه تکباکس <Badge variant="secondary">رایگان</Badge>
        </CardTitle>
        <CardDescription>آخرین مقالات، اخبار و محتوای تخصصی زیرساخت را مستقیماً در ایمیل خود دریافت کنید.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {status === "success" ? (
          <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4 text-sm text-green-600">{message}</div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام (اختیاری)</FormLabel>
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
                    <FormLabel>ایمیل</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ایمیل شما" dir="ltr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" loading={form.formState.isSubmitting} disabled={status === "loading"}>
                {status === "loading" ? "در حال ثبت..." : "عضویت در خبرنامه"}
              </Button>
              {status === "error" && <p className="text-sm text-destructive">{message}</p>}
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
