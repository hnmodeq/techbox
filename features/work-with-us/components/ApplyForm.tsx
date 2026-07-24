"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { TermsModal } from "./TermsModal";

const applySchema = z.object({
  name: z.string().min(3, "حداقل ۳ کاراکتر").max(100),
  email: z.string().email("ایمیل نامعتبر").max(200),
  phone: z.string().min(7, "شماره نامعتبر").max(20),
  message: z.string().max(2000).optional(),
});

type ApplyValues = z.infer<typeof applySchema>;

export default function ApplyForm({ jobSlug, termsContent }: { jobSlug: string; termsContent?: string }) {
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
      setError("لطفاً فایل رزومه را انتخاب کنید");
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
      <Card className="p-8 text-center space-y-4">
        <div className="text-4xl">✅</div>
        <h3 className="text-2xl font-bold">درخواست شما با موفقیت ثبت شد</h3>
        <p className="text-sm text-muted-foreground">تیم منابع انسانی تکباکس رزومه شما را بررسی کرده و در صورت تایید با شما تماس خواهند گرفت.</p>
        <ButtonLink href="/work-with-us">بازگشت به لیست مشاغل</ButtonLink>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl">ارسال رزومه</CardTitle>
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
                  <FormLabel>آدرس پست الکترونیکی *</FormLabel>
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

            {/* File upload */}
            <div className="space-y-2">
              <FormLabel>فایل رزومه *</FormLabel>
              <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/20 p-4 cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors">
                <Upload className="size-5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  {file ? file.name : "بارگذاری فایل"}
                </span>
                {file && (
                  <span className="text-[10px] text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                )}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  required
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="sr-only"
                />
              </label>
              <FormDescription className="text-[11px]">ترجیحا با فرمت PDF</FormDescription>
            </div>
          </div>

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>کمی درباره خودتان و چرا تکباکس؟</FormLabel>
                <FormControl>
                  <Textarea className="min-h-[120px]" placeholder="توضیحات..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <CardFooter className="flex justify-end gap-2 p-0 pt-2">
            <ButtonLink href="/work-with-us" variant="ghost">انصراف</ButtonLink>
            <Button type="submit" loading={loading || form.formState.isSubmitting}>
              {loading ? "در حال ارسال..." : "ارسال رزومه"}
            </Button>
          </CardFooter>

          <p className="text-xs text-muted-foreground">
            با کلیک روی دکمه ارسال، شما با <TermsModal content={termsContent} /> تکباکس موافقت می‌کنید.
          </p>
        </form>
      </Form>
    </Card>
  );
}
