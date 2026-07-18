"use client";

import { useEffect, useState, useCallback } from "react";
import PageHeader from "@/components/effects/PageHeader";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { formatRelativeDate } from "@/lib/date-format";

type Submission = {
  id: string;
  type: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  createdAt: string;
};

const STATUS_LABEL: Record<string, string> = {
  new: "جدید",
  read: "خوانده‌شده",
  resolved: "حل‌شده",
};

const STATUS_VARIANT: Record<string, "destructive" | "secondary" | "default"> = {
  new: "destructive",
  read: "secondary",
  resolved: "default",
};

export default function AdminInboxPage() {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"feedback" | "support" | "contact">("feedback");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/inbox?type=${tab}`, { cache: "no-store" });
      if (!res.ok) throw new Error("load_failed");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      toast.error("خطا در بارگذاری");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const markStatus = async (id: string, status: string) => {
    try {
      await fetch("/api/admin/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    } catch {
      toast.error("خطا در به‌روزرسانی");
    }
  };

  const TAB_LABELS: Record<string, string> = {
    feedback: "بازخوردها",
    support: "تیکت‌های پشتیبانی",
    contact: "تماس‌ها",
  };

  return (
    <main className="min-h-dvh px-4 py-10" dir="rtl">
      <Toaster dir="rtl" />
      <section className="mx-auto max-w-4xl space-y-6">
        <PageHeader colorVar="--admin" title="صندوق پیام‌ها" titleClassName="text-[var(--admin)]" description="بازخوردها، تیکت‌های پشتیبانی و پیام‌های تماس">
          <ButtonLink href="/admin" variant="ghost" size="sm">داشبورد</ButtonLink>
        </PageHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="feedback">بازخورد</TabsTrigger>
            <TabsTrigger value="support">پشتیبانی</TabsTrigger>
            <TabsTrigger value="contact">تماس</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="space-y-3 pt-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)
            ) : items.length === 0 ? (
              <Card className="p-8 text-center text-sm text-muted-foreground">
                {TAB_LABELS[tab] || "موردی"} جدیدی وجود ندارد.
              </Card>
            ) : (
              items.map((item) => (
                <Card key={item.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{item.name}</span>
                      <span className="text-xs text-muted-foreground" dir="ltr">{item.email}</span>
                    </div>
                    <Badge variant={STATUS_VARIANT[item.status] || "secondary"}>
                      {STATUS_LABEL[item.status] || item.status}
                    </Badge>
                  </div>
                  {item.subject && <div className="text-sm font-bold text-foreground">{item.subject}</div>}
                  <p className="text-sm text-muted-foreground leading-6 whitespace-pre-wrap">{item.message}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">{formatRelativeDate(item.createdAt)}</span>
                    <div className="flex gap-1.5">
                      {item.status !== "read" && (
                        <Button variant="ghost" size="xs" onClick={() => markStatus(item.id, "read")}>خوانده‌شد</Button>
                      )}
                      {item.status !== "resolved" && (
                        <Button variant="ghost" size="xs" onClick={() => markStatus(item.id, "resolved")}>حل‌شد</Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}
