"use client";
import Image from "next/image";
import { getModuleItems } from "@/lib/content";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import ModuleHeader from "@/components/effects/ModuleHeader";
import { CardStats } from "@/components/ui/card-stats";
import { formatRelativeDate } from "@/lib/date-format";
import { ForumBadge } from "@/components/ui/forum-badge";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { useStats } from "@/providers/stats.provider";

type ForumPost = ReturnType<typeof getModuleItems>[0] & { solved?: boolean };

const newTopicSchema = z.object({
  title: z.string().min(5, "عنوان حداقل ۵ کاراکتر").max(200),
  body: z.string().min(10, "جزئیات حداقل ۱۰ کاراکتر").max(5000),
});

type NewTopicValues = z.infer<typeof newTopicSchema>;

export default function ForumList({ serverItems }: { serverItems?: any[] }) {
  const { stats } = useStats();

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
  const [topicsError, setTopicsError] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [local, setLocal] = useState<(ForumPost & { avatar: string })[]>([]);
  const [filter, setFilter] = useState<"داغ" | "جدید" | "برتر" | "حل‌شده">("داغ");
  const [search, setSearch] = useState("");
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
        setTopicsError(false);
      })
      .catch(() => {
        if (mounted) {
          setDbItems(null);
          setTopicsError(true);
        }
      })
      .finally(() => {
        if (mounted) setLoadingTopics(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const realLikes = (t: ForumPost) => stats[`forum:${t.slug}`]?.likes ?? t.likes ?? 0;
  const realViews = (t: ForumPost) => stats[`forum:${t.slug}`]?.views ?? t.views ?? 0;
  const realSolved = (t: ForumPost) => stats[`forum:${t.slug}`]?.solved ?? (typeof (t as any).solved === "boolean" ? (t as any).solved : false);

  const sourceItems = dbItems ?? [];
  const merged = [...local, ...sourceItems].filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return `${t.title} ${t.excerpt}`.toLowerCase().includes(q);
  });
  const all = (() => {
    const list = [...merged];
    if (filter === "جدید") return list.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    if (filter === "برتر") return list.sort((a, b) => realLikes(b) - realLikes(a));
    if (filter === "حل‌شده") return list.filter((t) => realSolved(t));
    return list.sort((a, b) => realViews(b) - realViews(a));
  })();

  const submitTopic = async (values: NewTopicValues) => {
    setSubmitError("");
    // eslint-disable-next-line react-hooks/purity
    const slug = values.title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-").slice(0, 60) + "-" + Date.now().toString(36);
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
        category: "پرسش",
        solved: false,
      };
      setLocal((l) => [nt as ForumPost & { avatar: string }, ...l]);
      newTopicForm.reset();
      setShowNew(false);
    } catch {
      setSubmitError("خطا در اتصال به سرور.");
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-6" dir="rtl">
      <ModuleHeader module="forum" description="پرسش و پاسخ تخصصی زیرساخت و شبکه" count={loadingTopics ? "در حال دریافت…" : `${all.length.toLocaleString("fa-IR")} موضوع`}>
        <div className="flex gap-2">
          <Input placeholder="جستجو در انجمن…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />
          <Button onClick={() => setShowNew(true)}>+ موضوع جدید</Button>
        </div>
      </ModuleHeader>

      <div className="flex gap-2">
        {(["داغ", "جدید", "برتر", "حل‌شده"] as const).map((t) => (
          <Button key={t} variant={filter === t ? "secondary" : "ghost"} size="sm" onClick={() => setFilter(t)} className={filter === t ? "ring-1 ring-[var(--primary)]" : ""}>
            {t}
          </Button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden divide-y divide-border/60">
        <div className="hidden sm:grid grid-cols-12 text-xs text-muted-foreground px-4 py-2.5 bg-muted/30 font-bold">
          <div className="col-span-7">عنوان موضوع و نویسنده</div>
          <div className="col-span-1 text-center">امتیاز</div>
          <div className="col-span-2 text-center">پاسخ / بازدید</div>
          <div className="col-span-2 text-left">آخرین فعالیت</div>
        </div>
        {loadingTopics && all.length === 0 ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="grid grid-cols-12 px-3 sm:px-4 py-3.5 gap-2 items-center animate-pulse">
              <div className="col-span-12 sm:col-span-6 flex gap-3.5 items-center">
                <div className="h-11 w-11 rounded-full bg-muted" />
                <div className="flex-1 space-y-2"><div className="h-5 w-4/5 bg-muted rounded" /><div className="h-4 w-1/2 bg-muted rounded" /></div>
              </div>
            </div>
          ))
        ) : all.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">هنوز موضوعی در دیتابیس انجمن ثبت نشده است.</div>
        ) : (
          all.map((t) => (
            <Link key={t.slug} href={`/forum/${t.slug}`} className="group grid grid-cols-12 px-3 sm:px-4 py-3.5 hover:bg-muted/20 gap-2 items-center transition-colors">
              <div className="hidden sm:flex col-span-1 flex-col items-center text-xs text-muted-foreground">
                <span className="font-bold text-foreground">{realLikes(t).toLocaleString("fa-IR")}</span>
              </div>
              <div className="col-span-12 sm:col-span-6 flex gap-3.5 items-center">
                <Image src={t.avatar} alt={t.author?.name || "کاربر"} width={40} height={40} className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-border" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm group-hover:text-[var(--primary)] transition-colors line-clamp-1">{t.title}</span>
                    <ForumBadge slug={t.slug} fallback={typeof (t as any).solved === "boolean" ? realSolved(t) : null} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1 flex-wrap">
                    ارسال‌شده توسط
                    <b className="text-foreground">{t.author?.name || "کاربر تکباکس"}</b>
                    {(t.author as any)?.verifiedType && (
                      <VerifiedBadge type={(t.author as any).verifiedType as "content" | "org" | "user"} label={(t.author as any)?.verifiedLabel} size={13} />
                    )}
                    • {formatRelativeDate(t.date)}
                  </div>
                </div>
              </div>
              <div className="col-span-12 sm:col-span-4 flex items-center justify-end">
                <CardStats module="forum" slug={t.slug} initialViews={t.views} initialLikes={t.likes} initialComments={t.comments || 0} showComments={true} />
              </div>
              <div className="hidden sm:block col-span-1 text-left text-xs text-muted-foreground">{t.date_fa.split(" ")[0]}<br />{t.author?.name.split(" ")[0]}</div>
            </Link>
          ))
        )}
      </Card>

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
