"use client";
import Image from "next/image";
import { getModuleItems } from "@/lib/content";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { zIndex } from "@/design";
import { Button } from "@/components/ui/button";
import ModuleHeader from "@/components/effects/ModuleHeader";
import { ChipButton } from "@/components/ui/chip-button";
import { CloseButton } from "@/components/ui/close-button";
import { OverlayBackdrop } from "@/components/ui/overlay";
import { CardStats } from "@/components/ui/card-stats";
import { ForumBadge } from "@/components/ui/forum-badge";
import { useStats } from "@/providers/stats.provider";

type ForumPost = ReturnType<typeof getModuleItems>[0] & { solved?: boolean };

export default function ForumList({ serverItems }: { serverItems?: any[] }) {
  const { stats } = useStats();

  const fallbackItems = getModuleItems("forum").map((t) => ({
    ...t,
    avatar: t.author?.avatar || "/assets/hooman.png",
  })) as (ForumPost & { avatar: string })[];

  // If serverItems provided, use them directly
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
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [local, setLocal] = useState<(ForumPost & { avatar: string })[]>([]);
  const [filter, setFilter] = useState<"داغ" | "جدید" | "برتر" | "حل‌شده">("داغ");

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

  // Real stats/status come from the database (bulk /api/stats request). The
  // topic list itself is DB-first via /api/posts; no public static fallback is shown.
  const realLikes = (t: ForumPost) => stats[`forum:${t.slug}`]?.likes ?? t.likes ?? 0;
  const realViews = (t: ForumPost) => stats[`forum:${t.slug}`]?.views ?? t.views ?? 0;
  const realSolved = (t: ForumPost) =>
    stats[`forum:${t.slug}`]?.solved ?? (typeof (t as any).solved === "boolean" ? (t as any).solved : false);

  const sourceItems = dbItems ?? [];
  const merged = [...local, ...sourceItems];
  const all = (() => {
    const list = [...merged];
    if (filter === "جدید") return list.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    if (filter === "برتر") return list.sort((a, b) => realLikes(b) - realLikes(a));
    if (filter === "حل‌شده") return list.filter((t) => realSolved(t));
    return list.sort((a, b) => realViews(b) - realViews(a)); // داغ
  })();

  const [submitError, setSubmitError] = useState("");

  const submitTopic = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitError("");

    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
        .slice(0, 60) + "-" + Date.now().toString(36);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: "forum",
          slug,
          title: title.trim(),
          excerpt: body.slice(0, 140),
          content: body,
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

      // Success — add to local list and refresh
      const nt: any = {
        slug,
        module: "forum",
        title: title.trim(),
        excerpt: body.slice(0, 140),
        content: body,
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
      setTitle("");
      setBody("");
      setShowNew(false);
    } catch {
      setSubmitError("خطا در اتصال به سرور.");
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10" dir="rtl">
      <ModuleHeader
        module="forum"
        title="انجمن تکباکس"
        description="پرسش و پاسخ تخصصی زیرساخت و شبکه"
        count={loadingTopics ? "در حال دریافت…" : `${all.length.toLocaleString("fa-IR")} موضوع`}
      >
        <div className="flex gap-2">
          <input
            placeholder="جستجو در انجمن…"
            className="input w-56 text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold"
          />
          <Button
            onClick={() => setShowNew(true)}
            className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold"
          >
            + موضوع جدید
          </Button>
        </div>
      </ModuleHeader>

      <div className="flex gap-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] mb-4">
        {(["داغ", "جدید", "برتر", "حل‌شده"] as const).map((t) => (
          <ChipButton
            key={t}
            tone="forum"
            aria-pressed={filter === t}
            onClick={() => setFilter(t)}
            className={filter === t ? "ring-1 ring-[var(--forum)] text-[var(--forum)]" : ""}
          >
            {t}
          </ChipButton>
        ))}
      </div>

      <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] divide-y divide-[var(--border-color)]/60 overflow-hidden">
        <div className="hidden sm:grid grid-cols-12 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color px-4 py-2.5 bg-[var(--muted-background)]/30 font-bold">
          <div className="col-span-7">عنوان موضوع و نویسنده</div>
          <div className="col-span-1 text-center">امتیاز</div>
          <div className="col-span-2 text-center">پاسخ / بازدید</div>
          <div className="col-span-2 text-left">آخرین فعالیت</div>
        </div>
        {loadingTopics && all.length === 0 ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="grid grid-cols-12 px-3 sm:px-4 py-3.5 gap-2 items-center">
              <div className="hidden sm:block col-span-1 h-10 animate-pulse rounded-[var(--corner-radius)] bg-[var(--muted-background)]" />
              <div className="col-span-12 sm:col-span-6 flex gap-3.5 items-center">
                <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-[var(--muted-background)]" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-4/5 animate-pulse rounded-[var(--corner-radius)] bg-[var(--muted-background)]" />
                  <div className="h-4 w-1/2 animate-pulse rounded-[var(--corner-radius)] bg-[var(--muted-background)]" />
                </div>
              </div>
              <div className="col-span-12 sm:col-span-4 h-5 animate-pulse rounded-[var(--corner-radius)] bg-[var(--muted-background)]" />
            </div>
          ))
        ) : all.length === 0 ? (
          <div className="px-4 py-8 text-center paragraph-color">
            هنوز موضوعی در دیتابیس انجمن ثبت نشده است.
          </div>
        ) : all.map((t) => (
          <Link
            key={t.slug}
            href={`/forum/${t.slug}`}
            className="group grid grid-cols-12 px-3 sm:px-4 py-3.5 hover:bg-[var(--muted-background)]/20 gap-2 items-center transition-colors"
          >
            {/* vote column */}
            <div className="hidden sm:flex col-span-1 flex-col items-center paragraph-color text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">
              <Button
                type="button"
                variant="link"
                size="xs"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="paragraph-color hover:text-[var(--success)] font-bold"
              >
                ▲
              </Button>
              <span className="font-bold text-[var(--primary-text)]">
                {realLikes(t).toLocaleString("fa-IR")}
              </span>
              <Button
                type="button"
                variant="link"
                size="xs"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="paragraph-color hover:text-[var(--warning)] font-bold"
              >
                ▼
              </Button>
            </div>

            {/* main */}
            <div className="col-span-12 sm:col-span-6 flex gap-3.5 items-center">
              <Image
                src={t.avatar}
                alt={t.author?.name || "کاربر"}
                width={40}
                height={40}
                className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-[var(--border-color)]"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold font-bold transition-colors group-hover:text-[var(--forum)]">
                    {t.title}
                  </span>
                  <ForumBadge slug={t.slug} fallback={typeof (t as any).solved === "boolean" ? realSolved(t) : null} />
                </div>
                <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color mt-1">
                  ارسال‌شده توسط{" "}
                  <b className="text-[var(--primary-text)]">{t.author?.name || "کاربر تکباکس"}</b> •{" "}
                  {t.date_fa}
                </div>
              </div>
            </div>

            {/* stats */}
            <div className="col-span-12 sm:col-span-4 flex items-center justify-end px-2">
              <CardStats
                module="forum"
                slug={t.slug}
                
                
                showComments={true}
              />
            </div>
            <div className="hidden sm:block col-span-1 text-left text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
              {t.date_fa.split(" ")[0]}
              <br />
              {t.author?.name.split(" ")[0]}
            </div>
          </Link>
        ))}
      </div>

      {showNew && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: zIndex.modal }}
          dir="rtl"
        >
          <OverlayBackdrop onClick={() => setShowNew(false)} />
          <form
            onSubmit={submitTopic}
            className="relative bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] w-full max-w-2xl p-6 space-y-4 z-10 shadow-[var(--shadow-size)]"
          >
            <div className="flex justify-between items-center border-b-[length:var(--border-size)] border-[var(--border-color)] pb-3">
              <h3 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold font-bold">
                موضوع جدید در انجمن تکباکس
              </h3>
              <CloseButton onClick={() => setShowNew(false)} />
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان واضح و دقیق بپرسید…"
              className="input w-full"
              required
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="جزئیات کامل مشکل، توپولوژی، لاگ‌ها یا چیزی که تا الان امتحان کردید..."
              className="input w-full min-h-[160px]"
              required
            />
            {submitError && (
              <p className="text-[length:var(--paragraph-font-size)] text-[var(--danger)]">{submitError}</p>
            )}
            <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
              برای ایجاد موضوع جدید باید وارد حساب کاربری شوید.
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t-[length:var(--border-size)] border-[var(--border-color)]">
              <Button type="button" variant="ghost" onClick={() => setShowNew(false)}>
                انصراف
              </Button>
              <Button type="submit">ارسال موضوع</Button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
