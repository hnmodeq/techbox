"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

type ConsultationModalProps = {
  open: boolean;
  onClose: () => void;
};

const consultationSchema = z.object({
  orgName: z.string().min(2, "نام سازمان حداقل ۲ کاراکتر").max(200),
  email: z.string().email("ایمیل نامعتبر").max(200),
  phone: z.string().min(7, "تلفن نامعتبر").max(20),
  message: z.string().max(2000).optional(),
});

type ConsultationValues = z.infer<typeof consultationSchema>;

export default function ConsultationModal({ open, onClose }: ConsultationModalProps) {
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
          message: `شماره تماس: ${values.phone}\n\n${values.message || "درخواست مشاوره زیرساخت از فرم مشاوره"}`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus("success");
        toast.success("درخواست شما ثبت شد");
        form.reset();
      } else {
        setStatus("error");
        setErrorMsg(data.error || "خطا در ارسال درخواست");
      }
    } catch {
      setStatus("error");
      setErrorMsg("خطا در اتصال به سرور");
    }
  };

  const handleOpenChange = (o: boolean) => {
    if (!o) {
      onClose();
      if (status === "success") {
        setStatus("idle");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-[var(--consultation)]">درخواست مشاوره زیرساخت</DialogTitle>
          <DialogDescription>کارشناسان تکباکس به‌زودی با شما تماس می‌گیرند</DialogDescription>
        </DialogHeader>

        {status === "success" ? (
          <Card className="p-4 bg-[color-mix(in_oklch,var(--success)_10%,transparent)] border-[color-mix(in_oklch,var(--success)_30%,transparent)] text-center text-sm text-[var(--success)]">
            درخواست شما ثبت شد. کارشناسان تکباکس به‌زودی با شما تماس می‌گیرند.
          </Card>
        ) : (
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
                      <Textarea placeholder="سرور، شبکه، ذخیره‌سازی…" className="min-h-[110px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {status === "error" && <p className="text-sm text-destructive">{errorMsg}</p>}
              <Button type="submit" loading={form.formState.isSubmitting} className="w-full">
                {status === "loading" ? "در حال ارسال..." : "ارسال درخواست"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
