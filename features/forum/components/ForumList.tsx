"use client";
import Image from "next/image";
import { getModuleItems } from "@/lib/content";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { formatRelativeDate } from "@/lib/date-format";
import { ForumBadge } from "@/components/ui/forum-badge";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { useStats } from "@/providers/stats.provider";

type ForumPost = ReturnType<typeof getModuleItems>[0] & {
  solved?: boolean;
  comments?: number;
  acceptedAnswer?: { text: string; authorName: string } | null;
};

const newTopicSchema = z.object({
  title: z.string().min(5, "عنوان حداقل ۵ کاراکتر").max(200),
  body: z.string().min(10, "جزئیات حداقل ۱۰ کاراکتر").max(5000),
});

type NewTopicValues = z.infer<typeof newTopicSchema>;

const PAGE_SIZE = 20;

function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/#{1,6}\s*/g, "")
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\n{2,}/g, " ")
    .replace(/\n/g, " ")
    .trim();
}

export default function ForumList({ serverItems }: { serverItems?: any[] }) {
  const { stats } = useStats();
  const router = useRouter();

  const fallbackItems = getModuleItems("forum").map((t) => ({
    ...t,
    avatar: t.author?.avatar || "/assets/hooman.png",
  })) as (ForumPost & { avatar: string })[];

  const [dbItems, setDbItems] = useState<(ForumPost & { avatar: string })[] | null>(
    serverItems && serverItems.length > 0
      ? (serverItems.map((t) => ({
          ...t,
          avatar: t.author?.avatar || "/assets/hooman.png",
        })) as any)
      : null
  );
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [local, setLocal] = useState<(ForumPost & { avatar: string })[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [submitError, setSubmitError] = useState("");

  const newTopicForm = useForm<NewTopicValues>({
    resolver: zodResolver(newTopicSchema),
    defaultValues: { title: "", body: "" },
  });

  useEffect(() => {
    let mounted = true;
    fetch("/api/posts?module=forum&take=100", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("forum_posts_unavailable");
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        const nextItems = Array.isArray(data)
          ? data.map((t: ForumPost) => ({
              ...t,
              avatar: t.author?.avatar || "/assets/hooman.png",
            }))
          : [];
        setDbItems(nextItems as (ForumPost & { avatar: string })[]);
      })
      .catch(() => {
        if (mounted) setDbItems(null);
      })
      .finally(() => {
        if (mounted) setLoadingTopics(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const realSolved = (t: ForumPost) =>
    stats[`forum:${t.slug}`]?.solved ?? (typeof (t as any).solved === "boolean" ? (t as any).solved : false);

  const sourceItems = dbItems ?? [];
  const all = [...local, ...sourceItems].sort(
    (a, b) => +new Date(b.date) - +new Date(a.date)
  );
  const visible = all.slice(0, visibleCount);
  const hasMore = visibleCount < all.length;

  const submitTopic = async (values: NewTopicValues) => {
    setSubmitError("");
    const slug =
      values.title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-").slice(0, 60) +
      "-" +
      Date.now().toString(36);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: "forum",
          slug,
          title: values.title.trim(),
          excerpt: values.body.slice(0, 140),
          content: values.body,
          tags: ["پرسش", "تکباکس"],
          category: "پرسش",
          published: true,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setSubmitError("برای ایجاد موضوع جدید باید وارد حساب کاربری شوید.");
          return;
        }
        setSubmitError(data.error || "خطا در ثبت موضوع.");
        return;
      }
      const created = await res.json().catch(() => ({}));
      const createdSlug = typeof created?.slug === "string" ? created.slug : slug;
      const nt: any = {
        slug: createdSlug,
        module: "forum",
        title: values.title.trim(),
        excerpt: values.body.slice(0, 140),
        content: values.body,
        tags: ["پرسش", "تکباکس"],
        author: { name: "شما", role: "عضو", avatar: "/assets/hooman.png" },
        avatar: "/assets/hooman.png",
        date: new Date().toISOString(),
        date_fa: new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date()),
        likes: 0,
        views: 1,
        comments: 0,
        category: "پرسش",
        solved: false,
        acceptedAnswer: null,
      };
      setLocal((l) => [nt as ForumPost & { avatar: string }, ...l]);
      newTopicForm.reset();
      setShowNew(false);
    } catch {
      setSubmitError("خطا در اتصال به سرور.");
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-extrabold text-foreground">انجمن</h1>
        <Button onClick={() => setShowNew(true)} size="sm">+ موضوع جدید</Button>
      </div>

      {/* Topic list */}
      {loadingTopics && all.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-border bg-card animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : all.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-foreground font-bold mb-1">هنوز موضوعی ثبت نشده</p>
          <p className="text-muted-foreground text-sm mb-4">اولین نفری باشید که سؤال یا بحثی را شروع می‌کند.</p>
          <Button onClick={() => setShowNew(true)} size="sm">اولین موضوع را ایجاد کنید</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((t) => {
            const solved = realSolved(t);
            const replyCount = t.comments ?? 0;
            const excerpt = t.excerpt ? stripMarkdown(t.excerpt) : "";
            const accepted = (t as any).acceptedAnswer as { text: string; authorName: string } | null;

            return (
              <Link
                key={t.slug}
                href={`/forum/${t.slug}`}
                className="group block p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-accent/30 transition-all duration-200"
              >
                <div className="flex items-start gap-3.5">
                  {/* Avatar — clickable to author profile (button, not Link, to avoid <a> inside <a>) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      router.push(`/author/${encodeURIComponent(t.author?.username || (t.author?.name || "").trim().toLowerCase().replace(/[^a-z0-9_]+/g, "-"))}`);
                    }}
                    className="shrink-0 mt-0.5 hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <Image
                      src={t.avatar}
                      alt={t.author?.name || "کاربر"}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover ring-1 ring-border"
                    />
                  </button>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    {/* Title + badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {t.title}
                      </span>
                      <ForumBadge slug={t.slug} fallback={typeof (t as any).solved === "boolean" ? solved : null} />
                      {replyCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                          {replyCount.toLocaleString("fa-IR")} پاسخ
                        </span>
                      )}
                    </div>

                    {/* Excerpt */}
                    {excerpt && (
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1 leading-5">
                        {excerpt}
                      </p>
                    )}

                    {/* Author + time */}
                    <div className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1.5">
                      ایجاد شده توسط
                      <span className="font-semibold text-foreground/80">{t.author?.name || "کاربر تکباکس"}</span>
                      {(t.author as any)?.verifiedType && (
                        <VerifiedBadge
                          type={(t.author as any).verifiedType as "content" | "org" | "user"}
                          label={(t.author as any)?.verifiedLabel}
                          size={12}
                        />
                      )}
                      <span className="text-border">•</span>
                      <span>{formatRelativeDate(t.date)}</span>
                    </div>

                    {/* Best answer preview (solved topics only) */}
                    {solved && accepted && (
                      <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold text-emerald-600">✓ پاسخ برتر</span>
                          <span className="text-[10px] text-emerald-600/60">از {accepted.authorName}</span>
                        </div>
                        <p className="text-[11px] text-emerald-700/80 line-clamp-2 leading-5">
                          {stripMarkdown(accepted.text)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <svg className="size-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              </Link>
            );
          })}

          {/* Load more */}
          {hasMore && (
            <div className="text-center pt-2">
              <Button variant="ghost" size="sm" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                نمایش موضوعات بیشتر ({(all.length - visibleCount).toLocaleString("fa-IR")} باقی‌مانده)
              </Button>
            </div>
          )}
        </div>
      )}

      {/* New topic dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="sm:max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>موضوع جدید در انجمن تکباکس</DialogTitle>
            <DialogDescription>عنوان واضح بپرسید و جزئیات کامل مشکل را بنویسید — باید وارد حساب کاربری شوید.</DialogDescription>
          </DialogHeader>
          <Form {...newTopicForm}>
            <form onSubmit={newTopicForm.handleSubmit(submitTopic)} className="space-y-4">
              <FormField
                control={newTopicForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان</FormLabel>
                    <FormControl>
                      <Input placeholder="عنوان واضح و دقیق بپرسید…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={newTopicForm.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>جزئیات</FormLabel>
                    <FormControl>
                      <Textarea placeholder="جزئیات کامل مشکل، توپولوژی، لاگ‌ها یا چیزی که تا الان امتحان کردید..." className="min-h-[160px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {submitError && <p className="text-sm text-destructive">{submitError}</p>}
              <DialogFooter className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={() => setShowNew(false)}>انصراف</Button>
                <Button type="submit" loading={newTopicForm.formState.isSubmitting}>ارسال موضوع</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
