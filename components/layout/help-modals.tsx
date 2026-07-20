"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/providers/auth.provider";
import { VerificationRequestForm } from "@/features/auth/components/VerificationRequestForm";

type ModalType = "faq" | "feedback" | "support" | "verification" | null;

type Faq = { id: string; question: string; answer: string };

/** Single component holding all 3 help modals. Mounted once in LayoutShell;
 *  triggered from anywhere via window events: tb_open_faq / tb_open_feedback /
 *  tb_open_support (mirrors the tb_open_auth pattern). */
export function HelpModals() {
  const [open, setOpen] = useState<ModalType>(null);
  const { user } = useAuth();

  useEffect(() => {
    const make = (type: ModalType) => () => setOpen(type);
    const openFaq = make("faq");
    const openFeedback = make("feedback");
    const openSupport = make("support");
    const openVerification = make("verification");
    window.addEventListener("tb_open_faq", openFaq);
    window.addEventListener("tb_open_feedback", openFeedback);
    window.addEventListener("tb_open_support", openSupport);
    window.addEventListener("tb_open_verification", openVerification);
    return () => {
      window.removeEventListener("tb_open_faq", openFaq);
      window.removeEventListener("tb_open_feedback", openFeedback);
      window.removeEventListener("tb_open_support", openSupport);
      window.removeEventListener("tb_open_verification", openVerification);
    };
  }, []);

  const defaultName = user?.name || "";
  const defaultEmail = user?.email || "";

  return (
    <>
      <Toaster dir="rtl" />
      <FaqModal open={open === "faq"} onClose={() => setOpen(null)} />
      <FeedbackModal open={open === "feedback"} onClose={() => setOpen(null)} defaultName={defaultName} defaultEmail={defaultEmail} />
      <SupportModal open={open === "support"} onClose={() => setOpen(null)} defaultName={defaultName} defaultEmail={defaultEmail} />
      <VerificationModal open={open === "verification"} onClose={() => setOpen(null)} user={user} />
    </>
  );
}

// ─── FAQ Modal ───────────────────────────────────────────────
function FaqModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/faq")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setFaqs(Array.isArray(data) ? data : []))
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[520px] max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-lg font-black text-center">سوالات پرتکرار</DialogTitle>
          <DialogDescription className="text-center">پاسخ پرتکرارترین پرسش‌های کاربران</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="size-6" />
          </div>
        ) : faqs.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">هنوز سوالی ثبت نشده است.</Card>
        ) : (
          <Accordion className="text-right">
            {faqs.map((f) => (
              <AccordionItem key={f.id} value={f.id} className="border-b">
                <AccordionTrigger className="text-sm font-bold text-right justify-start hover:no-underline [&>svg]:hidden">
                  {f.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-6 text-right pb-3">
                  {f.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Feedback Modal ──────────────────────────────────────────
function FeedbackModal({ open, onClose, defaultName, defaultEmail }: { open: boolean; onClose: () => void; defaultName: string; defaultEmail: string }) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setEmail(defaultEmail);
      setMessage("");
      setError("");
      setDone(false);
    }
  }, [open, defaultName, defaultEmail]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || message.trim().length < 5) {
      setError("لطفاً همه فیلدها را به‌درستی پر کنید.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setDone(true);
        toast.success("بازخورد شما ثبت شد");
      } else {
        setError(data.error || "خطا در ثبت");
      }
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden" dir="rtl">
        <div className="p-6 sm:p-8 space-y-5">
          <DialogHeader className="text-center space-y-2">
            <DialogTitle className="text-lg font-black">ارسال بازخورد</DialogTitle>
            <DialogDescription className="text-xs">نظر، پیشنهاد یا انتقاد خود را برای ما بنویسید.</DialogDescription>
          </DialogHeader>
          {done ? (
            <Card className="p-4 text-center space-y-3">
              <p className="text-sm font-bold text-green-600">{error || "بازخورد شما با موفقیت ثبت شد. سپس از وقتتان!"}</p>
              <Button type="button" variant="link" size="sm" onClick={onClose}>بستن</Button>
            </Card>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {error && <Card className="p-3 bg-destructive/10 border-destructive/30 text-center text-xs font-bold text-destructive">{error}</Card>}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="fb-name" className="text-xs font-bold">نام</Label>
                  <Input id="fb-name" value={name} onChange={(e) => setName(e.target.value)} className="h-10 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fb-email" className="text-xs font-bold">ایمیل</Label>
                  <Input id="fb-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 text-sm" dir="ltr" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fb-msg" className="text-xs font-bold">بازخورد شما</Label>
                <Textarea id="fb-msg" value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[100px] text-sm" placeholder="نظر یا پیشنهاد..." />
              </div>
              <Button type="submit" disabled={busy} className="w-full h-10 font-bold">
                {busy ? "در حال ارسال..." : "ارسال بازخورد"}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Support Modal ───────────────────────────────────────────
type Ticket = {
  id: string;
  subject: string | null;
  message: string;
  status: string;
  createdAt: string;
  replies: TicketReply[];
};
type TicketReply = {
  id: string;
  authorName: string;
  authorRole: string;
  message: string;
  createdAt: string;
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    new: { label: "جدید", cls: "bg-red-500/15 text-red-600 border-red-500/30" },
    read: { label: "در حال بررسی", cls: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
    waiting_user: { label: "منتظر پاسخ شما", cls: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
    closed: { label: "بسته شد", cls: "bg-green-500/15 text-green-600 border-green-500/30" },
    resolved: { label: "بسته شد", cls: "bg-green-500/15 text-green-600 border-green-500/30" },
  };
  const s = map[status] || map.new;
  return <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${s.cls}`}>{s.label}</span>;
}

function SupportModal({ open, onClose, defaultName, defaultEmail }: { open: boolean; onClose: () => void; defaultName: string; defaultEmail: string }) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // View state: "new" = new ticket form, "list" = my tickets list, "thread" = single ticket conversation
  const [view, setView] = useState<"new" | "list" | "thread">("new");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyBusy, setReplyBusy] = useState(false);

  const loadTickets = async (emailToLoad?: string) => {
    const em = (emailToLoad || email).toLowerCase().trim();
    if (!em) return;
    setTicketsLoading(true);
    try {
      const res = await fetch(`/api/support/tickets?email=${encodeURIComponent(em)}`, { cache: "no-store" });
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch {
      setTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setEmail(defaultEmail);
      setSubject("");
      setMessage("");
      setError("");
      // If we have an email, auto-load their tickets
      if (defaultEmail) {
        setView("list");
        loadTickets(defaultEmail);
      } else {
        setView("new");
      }
    }
  }, [open, defaultName, defaultEmail]);

  const refreshThread = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/support/tickets?email=${encodeURIComponent(email.toLowerCase().trim())}`, { cache: "no-store" });
      const data = await res.json();
      const found = (data.tickets || []).find((t: Ticket) => t.id === ticketId);
      if (found) setActiveTicket(found);
    } catch {}
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || subject.trim().length < 2 || message.trim().length < 5) {
      setError("لطفاً همه فیلدها را به‌درستی پر کنید.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast.success("تیکت شما ثبت شد");
        setSubject("");
        setMessage("");
        setView("list");
        loadTickets(email);
      } else {
        setError(data.error || "خطا در ثبت");
      }
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setBusy(false);
    }
  };

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || replyText.trim().length < 2) return;
    setReplyBusy(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: activeTicket.id,
          email,
          name,
          message: replyText.trim(),
        }),
      });
      if (res.ok) {
        setReplyText("");
        await refreshThread(activeTicket.id);
      } else {
        toast.error("خطا در ثبت پاسخ");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setReplyBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden" dir="rtl">
        <div className="p-6 sm:p-7 space-y-4 max-h-[80vh] overflow-y-auto">
          <DialogHeader className="text-center space-y-2">
            <DialogTitle className="text-lg font-black">تیکت پشتیبانی</DialogTitle>
            <DialogDescription className="text-xs">مشکل خود را ثبت کنید و گفتگو را پیگیری کنید.</DialogDescription>
          </DialogHeader>

          {/* View toggle — hidden when reading a single ticket (back button shown instead) */}
          {view !== "thread" && (
          <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-muted">
            <button
              type="button"
              onClick={() => setView("new")}
              className={`h-8 rounded-md text-xs font-bold transition-colors ${view === "new" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
            >
              ثبت تیکت جدید
            </button>
            <button
              type="button"
              onClick={() => { setView("list"); loadTickets(); }}
              className={`h-8 rounded-md text-xs font-bold transition-colors ${view === "list" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
            >
              تیکت‌های من
            </button>
          </div>
          )}

          {/* New ticket form */}
          {(view === "new") && (
            <form onSubmit={submit} className="space-y-3">
              {error && <Card className="p-3 bg-destructive/10 border-destructive/30 text-center text-xs font-bold text-destructive">{error}</Card>}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sp-name" className="text-xs font-bold">نام</Label>
                  <Input id="sp-name" value={name} onChange={(e) => setName(e.target.value)} className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sp-email" className="text-xs font-bold">ایمیل</Label>
                  <Input id="sp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-9 text-sm" dir="ltr" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sp-subject" className="text-xs font-bold">موضوع</Label>
                <Input id="sp-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="h-9 text-sm" placeholder="موضوع تیکت" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sp-msg" className="text-xs font-bold">توضیحات</Label>
                <Textarea id="sp-msg" value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[90px] text-sm" placeholder="مشکل یا سوال خود را شرح دهید..." />
              </div>
              <Button type="submit" disabled={busy} className="w-full h-10 font-bold">
                {busy ? "در حال ارسال..." : "ثبت تیکت"}
              </Button>
            </form>
          )}

          {/* My tickets list */}
          {view === "list" && (
            <div className="space-y-2">
              {ticketsLoading ? (
                <div className="flex items-center justify-center py-8"><Spinner className="size-5" /></div>
              ) : tickets.length === 0 ? (
                <Card className="p-6 text-center text-sm text-muted-foreground space-y-3">
                  <p>هنوز تیکتی ثبت نکرده‌اید.</p>
                  <Button type="button" variant="link" size="sm" onClick={() => setView("new")}>ثبت تیکت جدید</Button>
                </Card>
              ) : (
                <>
                  {tickets.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => { setActiveTicket(t); setView("thread"); }}
                      className="w-full text-right rounded-lg border p-3 hover:border-foreground/20 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-bold text-foreground truncate">{t.subject || t.message.slice(0, 40)}</span>
                        <StatusBadge status={t.status} />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{t.message}</p>
                      <div className="text-[10px] text-muted-foreground mt-1">{new Date(t.createdAt).toLocaleDateString("fa-IR")}</div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Single ticket conversation */}
          {view === "thread" && activeTicket && (
            <div className="space-y-3">
              <button type="button" onClick={() => setView("list")} className="text-xs text-muted-foreground hover:text-foreground">→ بازگشت به لیست</button>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">{activeTicket.subject}</span>
                <StatusBadge status={activeTicket.status} />
              </div>
              {/* Conversation */}
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {/* Original message */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-3 py-2 text-xs leading-6 whitespace-pre-wrap">
                    {activeTicket.message}
                  </div>
                </div>
                {/* Replies */}
                {activeTicket.replies.map((r) => (
                  <div key={r.id} className={`flex ${r.authorRole === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-6 whitespace-pre-wrap ${
                      r.authorRole === "user"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-muted border text-foreground"
                    }`}>
                      {r.authorRole === "admin" && <div className="text-[10px] font-bold text-foreground/60 mb-0.5">{r.authorName}</div>}
                      {r.message}
                    </div>
                  </div>
                ))}
              </div>
              {activeTicket.status === "closed" && (
                <div className="text-center text-xs text-muted-foreground py-2">این تیکت بسته شده است.</div>
              )}
              {/* Reply box — locked when the ticket is closed */}
              {activeTicket.status !== "closed" && (
                <form onSubmit={submitReply} className="flex gap-2">
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="پاسخ خود را بنویسید..."
                    className="flex-1 h-9 text-xs"
                    disabled={replyBusy}
                  />
                  <Button type="submit" disabled={replyBusy || replyText.trim().length < 2} size="sm" className="px-3">
                    {replyBusy ? "…" : "ارسال"}
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Verification / Badge Request Modal ─────────────────────
function VerificationModal({ open, onClose, user }: { open: boolean; onClose: () => void; user: any }) {
  const [existingRequest, setExistingRequest] = React.useState<{ status: string; type: string; adminNote?: string } | null | undefined>(undefined);

  React.useEffect(() => {
    if (!open || !user) return;
    fetch("/api/verification/request")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setExistingRequest(d?.requests?.[0] || null))
      .catch(() => setExistingRequest(null));
  }, [open, user]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[480px] max-h-[85vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-lg font-black">درخواست نشان تایید هویت</DialogTitle>
          <DialogDescription className="text-right">
            نوع نشان مورد نظر را انتخاب کنید و اطلاعات درخواست را وارد کنید.
          </DialogDescription>
        </DialogHeader>
        {!user ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            برای درخواست نشان ابتدا وارد حساب کاربری خود شوید.
          </div>
        ) : (
          <VerificationRequestForm
            existingRequest={existingRequest}
            onSuccess={() => {
              fetch("/api/verification/request")
                .then((r) => (r.ok ? r.json() : null))
                .then((d) => setExistingRequest(d?.requests?.[0] || null))
                .catch(() => {});
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
