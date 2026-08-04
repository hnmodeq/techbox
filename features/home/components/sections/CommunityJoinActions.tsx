"use client";

import * as React from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/providers/auth.provider";

const MODULES = [
  ["blog", "مجله"],
  ["news", "اخبار"],
  ["media", "ویدیو"],
  ["review", "بررسی"],
  ["forum", "انجمن"],
  ["download", "دانلود"],
] as const;

export function CommunityJoinActions() {
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [modules, setModules] = React.useState<string[]>([]);
  const [message, setMessage] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const requestMembership = () => {
    window.dispatchEvent(new CustomEvent("tb_open_auth", { detail: { mode: "register" } }));
  };

  const requestAuthor = () => {
    if (!user) {
      toast.error("لطفا ابتدا ثبت نام کنید و دوباره برگردید.");
      return;
    }
    if (user.verifiedType === "content") {
      toast.info("حساب شما هم‌اکنون دسترسی نویسندگی تأییدشده دارد.");
      return;
    }
    setOpen(true);
  };

  const toggleModule = (slug: string) => {
    setModules((current) => current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (modules.length === 0) {
      toast.error("حداقل یک بخش را برای نویسندگی انتخاب کنید.");
      return;
    }
    if (message.trim().length < 20) {
      toast.error("لطفاً کمی درباره تجربه و موضوع‌های موردنظرتان توضیح دهید.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/verification/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "content",
          message: message.trim(),
          phone: phone.trim() || undefined,
          modules,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("درخواست نویسندگی شما ثبت شد.");
        setOpen(false);
        setMessage("");
        setPhone("");
        setModules([]);
      } else if (data.error === "already_pending") {
        toast.info("یک درخواست در انتظار بررسی دارید.");
      } else {
        toast.error("ارسال درخواست نویسندگی انجام نشد.");
      }
    } catch {
      toast.error("ارتباط با سرور برقرار نشد.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={requestMembership} className="min-w-32">عضویت</Button>
        <Button type="button" variant="outline" onClick={requestAuthor} className="min-w-40">درخواست نویسندگی</Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>درخواست نویسندگی در تکباکس</DialogTitle>
            <DialogDescription>
              حوزه‌های مورد علاقه و تجربه خود را بنویسید. درخواست پس از بررسی تیم تحریریه پاسخ داده می‌شود.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-bold text-foreground">بخش‌های موردنظر</p>
              <div className="flex flex-wrap gap-2">
                {MODULES.map(([slug, label]) => (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => toggleModule(slug)}
                    className={`border px-3 py-1.5 text-xs font-bold ${modules.includes(slug) ? "border-blue-500 bg-blue-500 text-white" : "border-border text-muted-foreground"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="author-request-phone" className="text-xs font-bold">شماره تماس (اختیاری)</label>
              <Input id="author-request-phone" value={phone} onChange={(event) => setPhone(event.target.value)} dir="ltr" className="mt-1" />
            </div>
            <div>
              <label htmlFor="author-request-message" className="text-xs font-bold">تجربه و پیشنهاد محتوایی</label>
              <Textarea
                id="author-request-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={5}
                className="mt-1"
                placeholder="درباره حوزه تخصصی، سابقه و موضوع‌هایی که می‌خواهید بنویسید توضیح دهید…"
              />
            </div>
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "در حال ارسال…" : "ارسال درخواست نویسندگی"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
