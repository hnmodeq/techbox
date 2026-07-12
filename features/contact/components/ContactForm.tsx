"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

const contactSchema = z.object({
  name: z.string().min(2, "نام حداقل ۲ کاراکتر").max(100),
  email: z.string().email("ایمیل نامعتبر").max(200),
  subject: z.string().max(200).optional(),
  message: z.string().min(5, "پیام حداقل ۵ کاراکتر").max(2000),
});

type ContactValues = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const [success, setSuccess] = React.useState(false);

  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const onSubmit = async (values: ContactValues) => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setSuccess(true);
        toast.success("پیام شما ارسال شد");
        form.reset();
      } else {
        toast.error(data?.message || "ارسال با خطا مواجه شد");
      }
    } catch {
      toast.error("ارتباط با سرور برقرار نشد");
    }
  };

  if (success) {
    return (
      <Card className="p-4 text-center">
        <CardContent className="pt-2 text-sm">پیام شما با موفقیت ارسال شد. با تشکر از همراهی شما.</CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نام</FormLabel>
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
                  <Input placeholder="email@example.com" type="email" dir="ltr" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>موضوع</FormLabel>
              <FormControl>
                <Input placeholder="موضوع پیام" {...field} />
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
              <FormLabel>پیام</FormLabel>
              <FormControl>
                <Textarea placeholder="پیام شما…" className="min-h-[140px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" loading={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "در حال ارسال…" : "ارسال"}
        </Button>
      </form>
    </Form>
  );
}
