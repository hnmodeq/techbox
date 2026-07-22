"use client";

import { useEffect, useState, useCallback } from "react";
import PageHeader from "@/components/effects/PageHeader";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { formatRelativeDate } from "@/lib/date-format";

type NewsItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  image: string | null;
  url: string;
  dateFa: string;
};

type Template = { subject: string; headerHtml: string; footerHtml: string };
type Campaign = {
  id: string;
  subject: string;
  recipientCount: number;
  status: string;
  sentAt: string;
};

export default function AdminNewsletterPage() {
  const [loading, setLoading] = useState(true);
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [subject, setSubject] = useState("");
  const [headerHtml, setHeaderHtml] = useState("");
  const [footerHtml, setFooterHtml] = useState("");

  const [savingTemplate, setSavingTemplate] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/newsletter", { cache: "no-store" });
      if (!res.ok) throw new Error("load_failed");
      const data = await res.json();
      setLatestNews(data.latestNews || []);
      setSubscriberCount(data.subscriberCount || 0);
      setCampaigns(data.campaigns || []);
      const t: Template = data.template;
      if (t) {
        setSubject((s) => s || t.subject);
        setHeaderHtml(t.headerHtml);
        setFooterHtml(t.footerHtml);
      }
    } catch {
      toast.error("خطا در بارگذاری");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selectedItems = latestNews.filter((n) => selected[n.id]);

  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    if (checked) latestNews.forEach((n) => (next[n.id] = true));
    setSelected(next);
  };

  const saveTemplate = async () => {
    setSavingTemplate(true);
    try {
      const res = await fetch("/api/admin/newsletter/template", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, headerHtml, footerHtml }),
      });
      if (res.ok) toast.success("قالب ذخیره شد");
      else toast.error("خطا در ذخیره قالب");
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSavingTemplate(false);
    }
  };

  const buildPayload = () => ({
    subject: subject.trim(),
    headerHtml,
    footerHtml,
    items: selectedItems.map((n) => ({
      module: "news",
      slug: n.slug,
      title: n.title,
      excerpt: n.excerpt,
      image: n.image,
      url: n.url,
      dateFa: n.dateFa,
    })),
  });

  const preview = async () => {
    if (selectedItems.length === 0) {
      toast.error("حداقل یک خبر انتخاب کنید");
      return;
    }
    setPreviewing(true);
    try {
      const res = await fetch("/api/admin/newsletter/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json();
      if (res.ok) {
        setPreviewHtml(data.html);
        toast.success("پیش‌نمایش آماده شد");
      } else {
        toast.error(data.error || "خطا در پیش‌نمایش");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setPreviewing(false);
    }
  };

  const send = async () => {
    if (selectedItems.length === 0) {
      toast.error("حداقل یک خبر انتخاب کنید");
      return;
    }
    if (subscriberCount === 0) {
      toast.error("هیچ عضو فعالی وجود ندارد");
      return;
    }
    if (!confirm(`ارسال به ${subscriberCount.toLocaleString("fa-IR")} عضو فعال؟ این عمل قابل بازگشت نیست.`)) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast.success(`ارسال شد: ${data.sent.toLocaleString("fa-IR")} موفق${data.failed ? ` / ${data.failed.toLocaleString("fa-IR")} ناموفق` : ""}`);
        setSelected({});
        load();
      } else {
        toast.error(data.error || "خطا در ارسال");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-dvh px-4 py-10" dir="rtl">
      <Toaster dir="rtl" />
      <section className="mx-auto max-w-5xl space-y-6">
        <PageHeader colorVar="--admin" title="خبرنامه" titleClassName="text-[var(--admin)]" description="انتخاب اخبار، ویرایش قالب و ارسال ایمیل هفتگی">
        </PageHeader>

        {/* Stats */}
        <div className="flex flex-wrap gap-3">
          <Card className="px-4 py-3">
            <div className="text-xs text-muted-foreground">اعضای فعال</div>
            <div className="text-2xl font-black text-foreground">
              {loading ? <Skeleton className="h-7 w-12" /> : subscriberCount.toLocaleString("fa-IR")}
            </div>
          </Card>
          <Card className="px-4 py-3">
            <div className="text-xs text-muted-foreground">خبرهای اخیر</div>
            <div className="text-2xl font-black text-foreground">
              {loading ? <Skeleton className="h-7 w-12" /> : latestNews.length.toLocaleString("fa-IR")}
            </div>
          </Card>
          <Card className="px-4 py-3">
            <div className="text-xs text-muted-foreground">موارد انتخاب‌شده</div>
            <div className="text-2xl font-black text-[var(--admin)]">{selectedItems.length.toLocaleString("fa-IR")}</div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* News picker */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-base">۱) انتخاب اخبار</CardTitle>
              <CardDescription>آخرین اخبار منتشرشده. مواردی که می‌خواهید ارسال شوند را تیک بزنید.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                <Checkbox
                  id="select-all-news"
                  checked={latestNews.length > 0 && latestNews.every((n) => selected[n.id])}
                  onCheckedChange={(v) => toggleAll(!!v)}
                />
                <Label htmlFor="select-all-news" className="text-xs font-bold cursor-pointer">انتخاب همه</Label>
              </div>
              <div className="max-h-[420px] overflow-y-auto space-y-2 ps-1">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
                ) : latestNews.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">خبری برای نمایش وجود ندارد.</p>
                ) : (
                  latestNews.map((n) => (
                    <label key={n.id} className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${selected[n.id] ? "border-[var(--admin)] bg-[var(--admin)]/5" : "hover:bg-muted/40"}`}>
                      <Checkbox checked={!!selected[n.id]} onCheckedChange={(v) => setSelected((s) => ({ ...s, [n.id]: !!v }))} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-foreground truncate">{n.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{n.excerpt || n.dateFa}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Template editor */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-base">۲) قالب ایمیل (سربرگ / سرصفحه)</CardTitle>
              <CardDescription>این بخش‌ها ثابت هستند و در همه ایمیل‌ها یکسان می‌شوند. کد HTML را ویرایش کنید.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nl-subject" className="text-xs font-bold">موضوع ایمیل</Label>
                <Input id="nl-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="موضوع خبرنامه" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nl-header" className="text-xs font-bold">سربرگ (HTML)</Label>
                <Textarea id="nl-header" value={headerHtml} onChange={(e) => setHeaderHtml(e.target.value)} className="font-mono text-xs min-h-[120px]" dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nl-footer" className="text-xs font-bold">سرصفحه (HTML)</Label>
                <Textarea id="nl-footer" value={footerHtml} onChange={(e) => setFooterHtml(e.target.value)} className="font-mono text-xs min-h-[120px]" dir="ltr" />
              </div>
              <Button variant="secondary" size="sm" onClick={saveTemplate} disabled={savingTemplate} loading={savingTemplate}>
                ذخیره قالب پیش‌فرض
              </Button>
              <p className="text-[11px] text-muted-foreground leading-5">دکمه «لغو عضویت» به‌صورت خودکار به انتهای هر ایمیل اضافه می‌شود و نیازی نیست در قالب قرار دهید.</p>
            </CardContent>
          </Card>
        </div>

        {/* Send / preview bar */}
        <Card className="p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            {selectedItems.length.toLocaleString("fa-IR")} خبر انتخاب شده — ارسال به{" "}
            <b className="text-foreground">{subscriberCount.toLocaleString("fa-IR")}</b> عضو فعال
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={preview} disabled={previewing || sending} loading={previewing}>
              پیش‌نمایش
            </Button>
            <Button onClick={send} disabled={sending || previewing} loading={sending}>
              ارسال خبرنامه
            </Button>
          </div>
        </Card>

        {/* Preview */}
        {previewHtml && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <CardTitle className="text-sm">پیش‌نمایش ایمیل</CardTitle>
              <Button variant="ghost" size="xs" onClick={() => setPreviewHtml(null)}>بستن</Button>
            </div>
            <Separator className="mb-3" />
            <div className="rounded-lg border overflow-hidden bg-muted/30 max-h-[520px] overflow-y-auto">
              {/* Preview is rendered server-side HTML; iframe isolates its styles. */}
              <iframe title="preview" srcDoc={previewHtml} className="w-full h-[520px] bg-white" />
            </div>
          </Card>
        )}

        {/* Campaign history */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-base">تاریخچه ارسال‌ها</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {loading ? (
              <Skeleton className="h-20 w-full" />
            ) : campaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">هنوز خبرنامه‌ای ارسال نشده است.</p>
            ) : (
              <div className="space-y-2">
                {campaigns.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-foreground truncate">{c.subject}</div>
                      <div className="text-xs text-muted-foreground">{formatRelativeDate(c.sentAt)} • {c.recipientCount.toLocaleString("fa-IR")} گیرنده</div>
                    </div>
                    <Badge variant={c.status === "sent" ? "secondary" : "destructive"}>
                      {c.status === "sent" ? "ارسال شد" : "ناموفق"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
