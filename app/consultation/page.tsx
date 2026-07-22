"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

const consultationSchema = z.object({
  orgName: z.string().min(2, "نام سازمان حداقل ۲").max(200),
  email: z.string().email("ایمیل نامعتبر").max(200),
  phone: z.string().min(7, "تلفن نامعتبر").max(20),
  message: z.string().max(2000).optional(),
});

type ConsultationValues = z.infer<typeof consultationSchema>;

export default function ConsultationPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const form = useForm<ConsultationValues>({
    resolver: zodResolver(consultationSchema),
    defaultValues: { orgName: "", email: "", phone: "", message: "" },
  });

  const onSubmit = async (values: ConsultationValues) => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.orgName,
          email: values.email,
          subject: "درخواست مشاوره زیرساخت",
          message: `شماره تماس: ${values.phone}\n\n${values.message || "درخواست مشاوره زیرساخت از صفحه مشاوره"}`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data?.message || data?.error || "خطا");
      setStatus("success");
      toast.success("درخواست شما ثبت شد");
      form.reset();
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e?.message || "خطا در اتصال");
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-5 py-16 space-y-6" dir="rtl">
            <h1 className="text-2xl font-extrabold tracking-tight">درخواست مشاوره زیرساخت</h1>
      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="orgName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نام سازمان</FormLabel>
                  <FormControl>
                    <Input placeholder="نام سازمان" {...field} />
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
                  <FormLabel>ایمیل کاری</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="ایمیل کاری" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تلفن</FormLabel>
                  <FormControl>
                    <Input placeholder="تلفن" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نیاز شما؟</FormLabel>
                  <FormControl>
                    <Textarea placeholder="سرور، شبکه، ذخیره‌سازی..." className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {status === "success" && <p className="text-sm text-green-600">درخواست شما ثبت شد. کارشناسان تکباکس به‌زودی با شما تماس می‌گیرند.</p>}
            {status === "error" && <p className="text-sm text-destructive">{errorMsg}</p>}

            <Button type="submit" loading={form.formState.isSubmitting} disabled={status === "loading"} className="w-full">
              {status === "loading" ? "در حال ارسال..." : "ارسال درخواست"}
            </Button>
          </form>
        </Form>
      </Card>
    </main>
  );
}
