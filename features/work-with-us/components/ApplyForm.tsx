"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const applySchema = z.object({
  name: z.string().min(3, "حداقل ۳ کاراکتر").max(100),
  email: z.string().email("ایمیل نامعتبر").max(200),
  phone: z.string().min(7, "شماره نامعتبر").max(20),
  message: z.string().max(2000).optional(),
});

type ApplyValues = z.infer<typeof applySchema>;

export default function ApplyForm({ jobSlug }: { jobSlug: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<ApplyValues>({
    resolver: zodResolver(applySchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  const onSubmit = async (values: ApplyValues) => {
    if (!file) {
      setError("لطفاً رزومه را انتخاب کنید");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("phone", values.phone);
    formData.append("message", values.message || "");
    formData.append("resume", file);

    try {
      const res = await fetch(`/api/jobs/${jobSlug}/apply`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "خطایی رخ داد");
      setSuccess(true);
      toast.success("درخواست شما ثبت شد");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="p-8 text-center space-y-4 mt-6">
        <div className="text-4xl">✅</div>
        <h3 className="text-2xl font-bold">درخواست شما با موفقیت ثبت شد</h3>
        <p className="text-sm text-muted-foreground">تیم منابع انسانی تکباکس رزومه شما را بررسی کرده و در صورت تایید با شما تماس خواهند گرفت.</p>
        <ButtonLink href="/work-with-us">بازگشت به لیست مشاغل</ButtonLink>
      </Card>
    );
  }

  return (
    <Card className="p-5 mt-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl flex items-center gap-2">
          ارسال درخواست <Badge variant="outline">Attachment — رزومه</Badge>
        </CardTitle>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && <div className="bg-destructive/10 border border-destructive/50 text-destructive p-3 rounded-md text-sm">{error}</div>}

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نام و نام خانوادگی *</FormLabel>
                  <FormControl>
                    <Input placeholder="مثلاً: علی رضایی" {...field} />
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
                  <FormLabel>ایمیل *</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" type="email" dir="ltr" {...field} />
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
                  <FormLabel>تلفن همراه *</FormLabel>
                  <FormControl>
                    <Input placeholder="09123456789" type="tel" dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <FormLabel>رزومه (PDF / Word) *</FormLabel>
              <div className="rounded-md border border-dashed p-3 bg-muted/20">
                <Input type="file" accept=".pdf,.doc,.docx" required onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-xs" />
                {file && (
                  <div className="mt-2 text-xs flex items-center gap-2">
                    <Badge variant="secondary">{file.name}</Badge>
                    <span className="text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                )}
                <FormDescription className="mt-2 text-[11px]">در آینده از Attachment shadcn استفاده خواهد شد (AttachmentMedia + AttachmentContent + AttachmentActions).</FormDescription>
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>کمی درباره خودتان و چرا تکباکس؟</FormLabel>
                <FormControl>
                  <Textarea className="min-h-[120px]" placeholder="توضیحات تکمیلی..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <CardFooter className="flex justify-end gap-2 p-0 pt-2">
            <ButtonLink href="/work-with-us" variant="ghost">انصراف</ButtonLink>
            <Button type="submit" loading={loading || form.formState.isSubmitting}>
              {loading ? "در حال ارسال..." : "ارسال درخواست همکاری"}
            </Button>
          </CardFooter>

          <p className="text-xs text-muted-foreground">
            با کلیک روی دکمه ارسال، شما با <Link href="/terms" className="text-primary underline">شرایط حفظ حریم خصوصی</Link> تکباکس موافقت می‌کنید.
          </p>
        </form>
      </Form>
    </Card>
  );
}
