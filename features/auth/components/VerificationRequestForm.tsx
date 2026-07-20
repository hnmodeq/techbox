"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { moduleMeta, type ModuleSlug } from "@/lib/content";

type TickType = "content" | "org" | "user";

const TICK_OPTIONS: { type: TickType; label: string; description: string; color: string }[] = [
  {
    type: "user",
    label: "کاربر تایید شده",
    description: "تایید هویت کاربر واقعی با ارسال مدارک",
    color: "text-green-500",
  },
  {
    type: "content",
    label: "تولید کننده محتوای تایید شده",
    description: "برای کسانی که می‌خواهند در تکباکس محتوا منتشر کنند",
    color: "text-blue-500",
  },
  {
    type: "org",
    label: "کاربر سازمانی تایید شده",
    description: "برای سازمان‌ها و شرکت‌ها",
    color: "text-purple-500",
  },
];

const CONTENT_MODULES = Object.entries(moduleMeta)
  .filter(([key]) => ["blog", "news", "media", "review", "forum", "download"].includes(key))
  .map(([key, meta]) => ({ slug: key as ModuleSlug, title: meta.titleFa }));

const baseSchema = z.object({
  message: z.string().min(20, "حداقل ۲۰ کاراکتر").max(2000),
  phone: z.string().min(8, "شماره معتبر وارد کنید").max(20).optional().or(z.literal("")),
  nationalId: z.string().min(6).max(20).optional().or(z.literal("")),
});

const orgSchema = baseSchema.extend({
  orgApplicantName: z.string().min(2).max(200),
  orgName: z.string().min(2).max(200),
  orgNationalId: z.string().min(5).max(30),
  orgPosition: z.string().min(2).max(200),
});

type FormData = z.infer<typeof orgSchema> & { modules?: string[] };

export function VerificationRequestForm({
  existingRequest,
  onSuccess,
}: {
  existingRequest?: { status: string; type: string; adminNote?: string } | null;
  onSuccess?: () => void;
}) {
  const [step, setStep] = useState<"choose" | "form">("choose");
  const [selectedType, setSelectedType] = useState<TickType | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const schema = selectedType === "org" ? orgSchema : baseSchema;

  const form = useForm<FormData>({
    resolver: zodResolver(schema as any),
    defaultValues: { message: "", phone: "", nationalId: "", orgApplicantName: "", orgName: "", orgNationalId: "", orgPosition: "" },
  });

  const toggleModule = (slug: string) => {
    setSelectedModules((prev) =>
      prev.includes(slug) ? prev.filter((m) => m !== slug) : [...prev, slug]
    );
  };

  const onSubmit = async (values: FormData) => {
    if (!selectedType) return;
    if (selectedType === "content" && selectedModules.length === 0) {
      toast.error("حداقل یک بخش را انتخاب کنید");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/verification/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          message: values.message,
          phone: values.phone || undefined,
          nationalId: values.nationalId || undefined,
          modules: selectedType === "content" ? selectedModules : undefined,
          orgApplicantName: selectedType === "org" ? values.orgApplicantName : undefined,
          orgName: selectedType === "org" ? values.orgName : undefined,
          orgNationalId: selectedType === "org" ? values.orgNationalId : undefined,
          orgPosition: selectedType === "org" ? values.orgPosition : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("درخواست شما با موفقیت ثبت شد");
        onSuccess?.();
      } else if (data.error === "already_pending") {
        toast.error("یک درخواست در انتظار بررسی دارید");
      } else {
        toast.error("خطا در ارسال درخواست");
      }
    } catch {
      toast.error("خطا در ارتباط");
    } finally {
      setBusy(false);
    }
  };

  if (existingRequest) {
    const approved = existingRequest.status === "approved";
    const pending = existingRequest.status === "pending";
    return (
      <div className="space-y-4">
        <div className={`rounded-lg border p-4 text-sm ${
          approved ? "border-green-500/30 bg-green-500/10" :
          pending ? "border-green-500/30 bg-green-500/10" :
          "border-red-500/30 bg-red-500/10"
        }`}>
          <div className="flex items-center gap-2 font-bold mb-1">
            {approved && <VerifiedBadge type={existingRequest.type as TickType} size={16} />}
            {approved ? "تایید شده ✅" : pending ? "در انتظار بررسی ⏳" : "رد شده ❌"}
          </div>
          {existingRequest.adminNote && (
            <p className="text-muted-foreground text-xs mt-1">{existingRequest.adminNote}</p>
          )}
        </div>
      </div>
    );
  }

  if (step === "choose") {
    return (
      <div className="space-y-3" dir="rtl">
        <p className="text-sm text-muted-foreground">نوع تایید هویت مورد نظر را انتخاب کنید:</p>
        {TICK_OPTIONS.map((opt) => (
          <button
            key={opt.type}
            type="button"
            onClick={() => { setSelectedType(opt.type); setStep("form"); }}
            className="w-full text-right rounded-lg border bg-card hover:bg-muted/60 transition-colors p-4 flex items-center gap-3"
          >
            <VerifiedBadge type={opt.type} size={22} />
            <div>
              <div className="font-bold text-sm">{opt.label}</div>
              <div className="text-xs text-muted-foreground">{opt.description}</div>
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
      <div className="flex items-center gap-2 mb-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setStep("choose")}>
          ← برگشت
        </Button>
        {selectedType && <VerifiedBadge type={selectedType} size={16} />}
        <span className="text-sm font-bold">
          {TICK_OPTIONS.find((o) => o.type === selectedType)?.label}
        </span>
      </div>

      {/* Blue tick: content modules selector */}
      {selectedType === "content" && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold">بخش‌هایی که می‌خواهید در آن‌ها محتوا منتشر کنید</Label>
          <div className="flex flex-wrap gap-2">
            {CONTENT_MODULES.map((m) => (
              <button
                key={m.slug}
                type="button"
                onClick={() => toggleModule(m.slug)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  selectedModules.includes(m.slug)
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {m.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Org-only fields */}
      {selectedType === "org" && (
        <div className="space-y-3 rounded-lg border p-3 bg-muted/20">
          <p className="text-xs font-bold text-muted-foreground">اطلاعات سازمانی</p>
          <div>
            <Label className="text-xs">نام و نام خانوادگی متقاضی</Label>
            <Input {...form.register("orgApplicantName")} className="mt-1" />
            {form.formState.errors.orgApplicantName && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.orgApplicantName.message}</p>
            )}
          </div>
          <div>
            <Label className="text-xs">نام سازمان / شرکت</Label>
            <Input {...form.register("orgName")} className="mt-1" />
            {form.formState.errors.orgName && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.orgName.message}</p>
            )}
          </div>
          <div>
            <Label className="text-xs">شناسه / کد ملی سازمان</Label>
            <Input {...form.register("orgNationalId")} dir="ltr" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">سمت شما در سازمان</Label>
            <Input {...form.register("orgPosition")} className="mt-1" />
          </div>
        </div>
      )}

      {/* Common: phone + national ID */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">شماره تلفن</Label>
          <Input {...form.register("phone")} dir="ltr" placeholder="09..." className="mt-1" />
        </div>
        <div>
          <Label className="text-xs">
            {selectedType === "org" ? "کد ملی متقاضی" : "کد ملی"}
          </Label>
          <Input {...form.register("nationalId")} dir="ltr" className="mt-1" />
        </div>
      </div>

      {/* Message */}
      <div>
        <Label className="text-xs">پیام درخواست</Label>
        {selectedType === "content" && (
          <p className="text-[11px] text-muted-foreground mb-1">
            توضیح دهید چه نوع محتوایی می‌خواهید منتشر کنید و سابقه شما چیست.
          </p>
        )}
        <Textarea
          {...form.register("message")}
          rows={4}
          placeholder="توضیحات درخواست شما..."
          className="mt-1"
        />
        {form.formState.errors.message && (
          <p className="text-xs text-destructive mt-1">{form.formState.errors.message.message}</p>
        )}
      </div>

      <Button type="submit" variant="primary" className="w-full" disabled={busy}>
        {busy ? "در حال ارسال..." : "ارسال درخواست"}
      </Button>
    </form>
  );
}
