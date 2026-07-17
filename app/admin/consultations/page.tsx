"use client";

import { useEffect, useState, useCallback } from "react";
import PageHeader from "@/components/effects/PageHeader";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ConsultationRequest = {
  id: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  items: { slug: string; title: string }[];
  notes: string | null;
  status: string;
  createdAt: string;
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "در انتظار", color: "bg-[var(--warning)]/10 text-[var(--warning)]" },
  contacted: { label: "تماس گرفته شد", color: "bg-[var(--info)]/10 text-[var(--info)]" },
  quoted: { label: "پیش‌فاکتور شده", color: "bg-[var(--shop)]/10 text-[var(--shop)]" },
  closed: { label: "بسته شده", color: "bg-muted text-muted-foreground" },
};

export default function AdminConsultationsPage() {
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/consultation", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "load_failed");
      setRequests(data.requests || []);
    } catch (e: any) {
      setMessage(e?.message || "خطا در دریافت درخواست‌ها");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/consultation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("update_failed");
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch {
      setMessage("خطا در بروزرسانی وضعیت");
    }
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <main className="min-h-dvh px-4 py-10 space-y-6" dir="rtl">
      <section className="mx-auto max-w-5xl space-y-6">
        <PageHeader
          colorVar="--shop"
          title="درخواست‌های مشاوره"
          titleClassName="text-[var(--shop)]"
          description={`${pendingCount} درخواست در انتظار پاسخ`}
        >
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/admin" variant="ghost" size="sm">داشبورد</ButtonLink>
            <Button type="button" variant="ghost" size="sm" onClick={load} disabled={loading}>به‌روزرسانی</Button>
          </div>
        </PageHeader>

        {message && <Card className="p-3 text-sm text-muted-foreground">{message}</Card>}

        {loading ? (
          <div className="text-center py-10 text-muted-foreground">در حال بارگذاری...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">هنوز درخواست مشاوره‌ای ثبت نشده است.</div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const statusInfo = STATUS_MAP[req.status] || STATUS_MAP.pending;
              return (
                <Card key={req.id} className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={`${statusInfo.color} border-none text-xs`}>{statusInfo.label}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(req.createdAt).toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      {req.userName && (
                        <div className="text-sm font-semibold">{req.userName} {req.userEmail && <span className="text-muted-foreground font-normal">({req.userEmail})</span>}</div>
                      )}
                    </div>
                      <Select value={req.status} onValueChange={(v) => { if (v) updateStatus(req.id, v); }}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">در انتظار</SelectItem>
                        <SelectItem value="contacted">تماس گرفته شد</SelectItem>
                        <SelectItem value="quoted">پیش‌فاکتور شده</SelectItem>
                        <SelectItem value="closed">بسته شده</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(req.items) && req.items.map((item: any) => (
                      <a
                        key={item.slug}
                        href={`/shop/${item.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-[var(--corner-radius)] bg-[var(--shop)]/5 px-2 py-1 text-xs font-medium text-[var(--shop)] hover:bg-[var(--shop)]/10 transition-colors"
                      >
                        {item.title}
                      </a>
                    ))}
                  </div>

                  {req.notes && (
                    <div className="rounded-[var(--corner-radius)] bg-muted/30 p-3 text-sm paragraph-color">
                      <span className="font-semibold text-[var(--primary-text)]">توضیحات مشتری: </span>
                      {req.notes}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
