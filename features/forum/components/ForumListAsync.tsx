"use client";
import Image from "next/image";
import Link from "next/link";
import { ContentItem } from "@/lib/content";
import { useState } from "react";
import { zIndex } from "@/design";
import { Button } from "@/components/ui/button";
import ModuleHeader from "@/components/effects/ModuleHeader";
import { ChipButton } from "@/components/ui/chip-button";
import { CloseButton } from "@/components/ui/close-button";
import { OverlayBackdrop } from "@/components/ui/overlay";
import { CardStats } from "@/components/ui/card-stats";
import { ForumBadge } from "@/components/ui/forum-badge";

type ForumPost = ContentItem & { solved?: boolean };

export default function ForumListAsync({ items }: { items: ContentItem[] }) {
  const [localTopics, setLocalTopics] = useState<ForumPost[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<"داغ" | "جدید" | "برتر" | "حل‌شده">("داغ");
  const [error, setError] = useState("");

  const merged = [...localTopics, ...items];
  const all = (() => {
    const list = [...merged];
    if (filter === "جدید") return list.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    if (filter === "برتر") return list.sort((a, b) => b.likes - a.likes);
    if (filter === "حل‌شده") return list.filter((t) => t.solved);
    return list.sort((a, b) => b.views - a.views);
  })();

  const submitTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: "forum",
          slug: title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-").slice(0, 60) + "-" + Date.now().toString(36),
          title: title.trim(),
          excerpt: body.slice(0, 200),
          content: body,
          tags: ["پرسش", "تکباکس"],
          category: "پرسش",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "خطا در ثبت موضوع");
      }

      const created = await res.json();
      // Add to local list immediately
      setLocalTopics((l) => [{
        slug: created.slug,
        module: "forum" as any,
        title: title.trim(),
        excerpt: body.slice(0, 140),
        content: body,
        tags: ["پرسش", "تکباکس"],
        author: { name: "شما", role: "عضو", avatar: "/assets/hooman.png" },
        date: new Date().toISOString(),
        date_fa: new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date()),
        likes: 0,
        views: 1,
        category: "پرسش",
      }, ...l]);
      setTitle("");
      setBody("");
      setShowNew(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10" dir="rtl">
      <ModuleHeader module="forum" title="انجمن تکباکس" description="پرسش و پاسخ تخصصی زیرساخت و شبکه" count={`${all.length.toLocaleString("fa-IR")} موضوع`}>
        <div className="flex gap-2">
          <input placeholder="جستجو در انجمن…" className="input w-56 text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold" />
          <Button onClick={() => setShowNew(true)} className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold">+ موضوع جدید</Button>
        </div>
      </ModuleHeader>

      <div className="flex gap-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] mb-4">
        {(["داغ", "جدید", "برتر", "حل‌شده"] as const).map((t) => (
          <ChipButton key={t} tone="forum" aria-pressed={filter === t} onClick={() => setFilter(t)} className={filter === t ? "ring-1 ring-[var(--forum)] text-[var(--forum)]" : ""}>
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
        {all.map((t) => (
          <Link key={t.slug} href={`/forum/${t.slug}`} className="group grid grid-cols-12 px-3 sm:px-4 py-3.5 hover:bg-[var(--muted-background)]/20 gap-2 items-center transition-colors">
            <div className="hidden sm:flex col-span-1 flex-col items-center paragraph-color text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">
              <Button type="button" variant="link" size="xs" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="paragraph-color hover:text-[var(--success)] font-bold">▲</Button>
              <span className="font-bold text-[var(--primary-text)]">{t.likes.toLocaleString("fa-IR")}</span>
              <Button type="button" variant="link" size="xs" onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); }} className="paragraph-color hover:text-[var(--warning)] font-bold">▼</Button>
            </div>
            <div className="col-span-12 sm:col-span-6 flex gap-3.5 items-center">
              <Image src={t.author?.avatar || "/assets/hooman.png"} alt={t.author?.name || "کاربر"} width={40} height={40} className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-[var(--border-color)]" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold font-bold transition-colors group-hover:text-[var(--forum)]">{t.title}</span>
                  <ForumBadge slug={t.slug} />
                </div>
                <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color mt-1">
                  ارسال‌شده توسط <b className="text-[var(--primary-text)]">{t.author?.name || "کاربر تکباکس"}</b> • {t.date_fa}
                </div>
              </div>
            </div>
            <div className="col-span-12 sm:col-span-4 flex items-center justify-end px-2">
              <CardStats module="forum" slug={t.slug} initialViews={t.views ?? 0} initialLikes={t.likes ?? 0} showComments={true} />
            </div>
            <div className="hidden sm:block col-span-1 text-left text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
              {t.date_fa.split(" ")[0]}<br />{t.author?.name.split(" ")[0]}
            </div>
          </Link>
        ))}
      </div>

      {error && <p className="text-[var(--danger)] text-sm mt-2">{error}</p>}

      {showNew && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: zIndex.modal }} dir="rtl">
          <OverlayBackdrop onClick={() => setShowNew(false)} />
          <form onSubmit={submitTopic} className="relative bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] w-full max-w-2xl p-6 space-y-4 z-10 shadow-[var(--shadow-size)]">
            <div className="flex justify-between items-center border-b-[length:var(--border-size)] border-[var(--border-color)] pb-3">
              <h3 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold font-bold">موضوع جدید در انجمن تکباکس</h3>
              <CloseButton onClick={() => setShowNew(false)} />
            </div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان واضح و دقیق بپرسید…" className="input w-full" required />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="جزئیات کامل مشکل، توپولوژی، لاگ‌ها یا چیزی که تا الان امتحان کردید..." className="input w-full min-h-[160px]" required />
            <div className="flex justify-end gap-2 pt-2 border-t-[length:var(--border-size)] border-[var(--border-color)]">
              <Button type="button" variant="ghost" onClick={() => setShowNew(false)} disabled={submitting}>انصراف</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "در حال ارسال..." : "ارسال موضوع"}</Button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}