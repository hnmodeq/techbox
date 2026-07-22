"use client";

import { useEffect, useState, useCallback } from "react";
import PageHeader from "@/components/effects/PageHeader";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { formatRelativeDate } from "@/lib/date-format";

type TicketReply = {
  id: string;
  authorName: string;
  authorRole: string;
  message: string;
  createdAt: string;
};

type Submission = {
  id: string;
  type: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  createdAt: string;
  replies?: TicketReply[];
};

const STATUS_LABEL: Record<string, string> = {
  new: "جدید",
  read: "در حال بررسی",
  waiting_user: "منتظر پاسخ کاربر",
  closed: "بسته شد",
  resolved: "بسته شد",
};

const STATUS_VARIANT: Record<string, "destructive" | "secondary" | "default"> = {
  new: "destructive",
  read: "secondary",
  waiting_user: "default",
  closed: "default",
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

  const [activeTicket, setActiveTicket] = useState<Submission | null>(null);
  const [adminReply, setAdminReply] = useState("");
  const [replyBusy, setReplyBusy] = useState(false);

  const submitAdminReply = async () => {
    if (!activeTicket || adminReply.trim().length < 2) return;
    setReplyBusy(true);
    try {
      const res = await fetch(`/api/admin/inbox/${activeTicket.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: adminReply.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        const updated = { ...activeTicket, replies: [...(activeTicket.replies || []), data.reply] };
        setActiveTicket(updated);
        setItems((prev) => prev.map((i) => (i.id === activeTicket.id ? updated : i)));
        setAdminReply("");
        toast.success("پاسخ ارسال شد");
      } else {
        toast.error("خطا در ارسال پاسخ");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setReplyBusy(false);
    }
  };

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
        </PageHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="feedback">بازخورد</TabsTrigger>
            <TabsTrigger value="support">تیکت</TabsTrigger>
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
              activeTicket ? (
                <Card className="p-4 space-y-3">
                  <button type="button" onClick={() => setActiveTicket(null)} className="text-xs text-muted-foreground hover:text-foreground">→ بازگشت به لیست</button>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-foreground">{activeTicket.name}</span>
                      <span className="text-xs text-muted-foreground ms-2" dir="ltr">{activeTicket.email}</span>
                    </div>
                    <Badge variant={STATUS_VARIANT[activeTicket.status] || "secondary"}>{STATUS_LABEL[activeTicket.status] || activeTicket.status}</Badge>
                  </div>
                  {activeTicket.subject && <div className="text-sm font-bold text-foreground">{activeTicket.subject}</div>}
                  {/* Conversation */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted border px-3 py-2 text-xs leading-6 whitespace-pre-wrap">
                        <div className="text-[10px] font-bold text-foreground/60 mb-0.5">{activeTicket.name}</div>
                        {activeTicket.message}
                      </div>
                    </div>
                    {(activeTicket.replies || []).map((r) => (
                      <div key={r.id} className={`flex ${r.authorRole === "admin" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-6 whitespace-pre-wrap ${
                          r.authorRole === "admin"
                            ? "rounded-br-sm bg-primary text-primary-foreground"
                            : "rounded-bl-sm bg-muted border"
                        }`}>
                          {r.authorRole === "user" && <div className="text-[10px] font-bold text-foreground/60 mb-0.5">{r.authorName}</div>}
                          {r.message}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Admin reply box — locked when closed */}
                  {activeTicket.status !== "closed" && (
                    <div className="flex gap-2">
                      <Input value={adminReply} onChange={(e) => setAdminReply(e.target.value)} placeholder="پاسخ به کاربر..." className="flex-1 h-9 text-sm" disabled={replyBusy} />
                      <Button size="sm" onClick={submitAdminReply} disabled={replyBusy || adminReply.trim().length < 2} loading={replyBusy}>ارسال</Button>
                    </div>
                  )}
                  <div className="flex gap-1.5">
                    {activeTicket.status === "new" && <Button variant="ghost" size="xs" onClick={() => { markStatus(activeTicket.id, "read"); setActiveTicket(null); }}>خوانده‌شد</Button>}
                    {activeTicket.status !== "closed" && <Button variant="ghost" size="xs" onClick={() => { markStatus(activeTicket.id, "closed"); setActiveTicket(null); }}>بستن تیکت</Button>}
                  </div>
                </Card>
              ) : (
              items.map((item) => (
                <Card key={item.id} className="p-4 space-y-2 cursor-pointer hover:border-foreground/20 transition-colors" onClick={() => { setActiveTicket(item); if (item.status === "new") markStatus(item.id, "read"); }}>
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
                  <p className="text-sm text-muted-foreground leading-6 whitespace-pre-wrap line-clamp-2">{item.message}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">{formatRelativeDate(item.createdAt)}</span>
                    {tab === "support" && (item.replies?.length || 0) > 0 && (
                      <span className="text-[10px] text-muted-foreground">{item.replies?.length} پاسخ</span>
                    )}
                  </div>
                </Card>
              ))
              )
            )}
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}
