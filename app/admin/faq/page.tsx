"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentUserClient } from "@/lib/auth";

const faqSchema = z.object({
  question: z.string().min(3, "حداقل ۳ کاراکتر").max(500),
  answer: z.string().min(5, "حداقل ۵ کاراکتر").max(5000),
  order: z.coerce.number().int().min(0).max(10000).default(0),
  isActive: z.boolean().default(true),
});

type FaqValues = z.infer<typeof faqSchema>;
type Faq = FaqValues & { id: string; createdAt: string; updatedAt: string };

export default function AdminFaqPage() {
  const [user, setUser] = React.useState(() => getCurrentUserClient());
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Faq | null>(null);

  const form = useForm<any>({
    resolver: zodResolver(faqSchema as any),
    defaultValues: { question: "", answer: "", order: 0, isActive: true },
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/faq", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setFaqs(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    setUser(getCurrentUserClient());
    load();
  }, [form]);

  useEffect(() => {
    if (editing) {
      form.reset({ question: editing.question, answer: editing.answer, order: editing.order, isActive: editing.isActive });
    } else {
      form.reset({ question: "", answer: "", order: faqs.length, isActive: true });
    }
  }, [editing, faqs.length, form]);

  if (!user || (user.role !== "super_admin" && user.role !== "editor")) {
    return (
      <main className="min-h-dvh p-8" dir="rtl">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>عدم دسترسی</CardTitle>
            <CardDescription>فقط super_admin و editor</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const onSubmit = async (values: any) => {
    try {
      if (editing) {
        const res = await fetch(`/api/admin/faq/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error((await res.json()).error || "خطا");
        toast.success("ویرایش شد");
      } else {
        const res = await fetch("/api/admin/faq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error((await res.json()).error || "خطا");
        toast.success("ایجاد شد");
      }
      setEditing(null);
      load();
    } catch (e: any) {
      toast.error(e?.message || "خطا");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("حذف شود؟")) return;
    try {
      const res = await fetch(`/api/admin/faq/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("خطا در حذف");
      toast.success("حذف شد");
      load();
    } catch (e: any) {
      toast.error(e?.message || "خطا");
    }
  };

  const toggleActive = async (faq: Faq) => {
    try {
      const res = await fetch(`/api/admin/faq/${faq.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !faq.isActive }),
      });
      if (!res.ok) throw new Error("خطا");
      load();
    } catch {}
  };

  return (
    <main className="min-h-dvh bg-background p-4 md:p-8" dir="rtl">
      <Toaster dir="rtl" />
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">مدیریت FAQ — درباره ما</h1>
            <p className="text-sm text-muted-foreground mt-1">پرسش و پاسخ‌های صفحه درباره ما — با Accordion نمایش داده می‌شود</p>
          </div>
          <div className="flex gap-2">
            <ButtonLink href="/admin" variant="ghost" size="sm">داشبورد</ButtonLink>
            <ButtonLink href="/about" variant="outline" size="sm">نمایش درباره ما</ButtonLink>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle>{editing ? "ویرایش FAQ" : "افزودن FAQ جدید"}</CardTitle>
              <CardDescription>ترتیب {editing ? `فعلی: ${editing.order}` : `پیشنهادی: ${faqs.length}`} — فعال/غیرفعال</CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control as any}
                    name="question"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>سوال</FormLabel>
                        <FormControl>
                          <Input placeholder="مثلاً: تکباکس چیست؟" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="answer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>پاسخ</FormLabel>
                        <FormControl>
                          <Textarea placeholder="پاسخ کامل..." className="min-h-[120px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control as any}
                      name="order"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ترتیب</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-2">
                          <FormLabel>وضعیت</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2 h-9">
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                              <span className="text-xs">{field.value ? "فعال" : "غیرفعال"}</span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button type="submit" loading={form.formState.isSubmitting} className="flex-1">
                    {editing ? "ذخیره ویرایش" : "افزودن"}
                  </Button>
                  {editing && (
                    <Button type="button" variant="outline" onClick={() => setEditing(null)} className="flex-1">
                      انصراف
                    </Button>
                  )}
                </CardFooter>
              </form>
            </Form>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>لیست FAQ ({faqs.length})</CardTitle>
              <CardDescription>با Data Table ساده — در آینده می‌توان به TanStack Data Table ارتقا داد</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 text-center text-sm text-muted-foreground">در حال بارگذاری…</div>
              ) : faqs.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">هنوز FAQ ثبت نشده</div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">ترتیب</TableHead>
                        <TableHead className="text-right">سوال</TableHead>
                        <TableHead className="text-right">وضعیت</TableHead>
                        <TableHead className="text-right">عملیات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {faqs.map((f) => (
                        <TableRow key={f.id}>
                          <TableCell className="font-mono text-xs">{f.order}</TableCell>
                          <TableCell className="max-w-[300px] truncate text-xs" title={f.question}>
                            {f.question}
                          </TableCell>
                          <TableCell>
                            <Badge variant={f.isActive ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleActive(f)}>
                              {f.isActive ? "فعال" : "غیرفعال"}
                            </Badge>
                          </TableCell>
                          <TableCell className="flex gap-1">
                            <Button size="xs" variant="ghost" onClick={() => setEditing(f)}>ویرایش</Button>
                            <Button size="xs" variant="ghost" onClick={() => onDelete(f.id)} className="text-destructive hover:text-destructive">
                              حذف
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
