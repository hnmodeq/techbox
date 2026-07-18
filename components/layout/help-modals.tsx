"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/providers/auth.provider";

type ModalType = "faq" | "feedback" | "support" | null;

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
    window.addEventListener("tb_open_faq", openFaq);
    window.addEventListener("tb_open_feedback", openFeedback);
    window.addEventListener("tb_open_support", openSupport);
    return () => {
      window.removeEventListener("tb_open_faq", openFaq);
      window.removeEventListener("tb_open_feedback", openFeedback);
      window.removeEventListener("tb_open_support", openSupport);
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
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)
        ) : faqs.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">هنوز سوالی ثبت نشده است.</Card>
        ) : (
          <Accordion>
            {faqs.map((f) => (
              <AccordionItem key={f.id} value={f.id}>
                <AccordionTrigger className="text-sm font-bold text-right">{f.question}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-6">{f.answer}</AccordionContent>
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
function SupportModal({ open, onClose, defaultName, defaultEmail }: { open: boolean; onClose: () => void; defaultName: string; defaultEmail: string }) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setEmail(defaultEmail);
      setSubject("");
      setMessage("");
      setError("");
      setDone(false);
    }
  }, [open, defaultName, defaultEmail]);

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
        setDone(true);
        toast.success("تیکت شما ثبت شد");
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
            <DialogTitle className="text-lg font-black">پشتیبانی</DialogTitle>
            <DialogDescription className="text-xs">مشکل یا سوال خود را ثبت کنید تا تیم پشتیبانی پاسخ دهد.</DialogDescription>
          </DialogHeader>
          {done ? (
            <Card className="p-4 text-center space-y-3">
              <p className="text-sm font-bold text-green-600">تیکت شما ثبت شد. تیم پشتیبانی به‌زودی پاسخ خواهد داد.</p>
              <Button type="button" variant="link" size="sm" onClick={onClose}>بستن</Button>
            </Card>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {error && <Card className="p-3 bg-destructive/10 border-destructive/30 text-center text-xs font-bold text-destructive">{error}</Card>}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sp-name" className="text-xs font-bold">نام</Label>
                  <Input id="sp-name" value={name} onChange={(e) => setName(e.target.value)} className="h-10 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sp-email" className="text-xs font-bold">ایمیل</Label>
                  <Input id="sp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 text-sm" dir="ltr" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sp-subject" className="text-xs font-bold">موضوع</Label>
                <Input id="sp-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="h-10 text-sm" placeholder="موضوع تیکت" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sp-msg" className="text-xs font-bold">توضیحات</Label>
                <Textarea id="sp-msg" value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[100px] text-sm" placeholder="مشکل یا سوال خود را شرح دهید..." />
              </div>
              <Button type="submit" disabled={busy} className="w-full h-10 font-bold">
                {busy ? "در حال ارسال..." : "ثبت تیکت"}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
