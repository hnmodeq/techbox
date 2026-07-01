"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/design/icons";
import commentsData from "@/data/comments.json";
import { Button } from "@/components/ui/Button";

type ForumDetailProps = {
  item: any;
};

export default function ForumDetail({ item }: ForumDetailProps) {
  const solved = !item.slug.includes("proxmox");
  
  // Pull real comments for this topic or create realistic initial replies
  const initialReplies = (() => {
    const matched = (commentsData as any[]).filter((c) => c.content_slug === item.slug);
    if (matched.length > 0) {
      return matched.map((m, idx) => ({
        id: m.id || `rep-${idx}`,
        author: m.author || "کاربر شبکه",
        avatar: m.author_avatar || "/assets/hooman.png",
        text: m.text,
        likes: m.likes || 4,
        date: m.date || "لحظاتی پیش",
        isBestAnswer: idx === 0 && solved,
      }));
    }
    return [
      {
        id: "rep-1",
        author: "مهندس زیرساخت (کارشناس ارشد)",
        avatar: "/assets/hooman.png",
        text: "سلام. برای این سناریو حتماً پیشنهاد می‌کنم ابتدا تنظیمات MTU و Flow Control را روی هر دو سمت بررسی کنید. در ۹۰ درصد مواقع مشکل از عدم تطابق بافر پورت سوئیچ است.",
        likes: 18,
        date: "۲ ساعت پیش",
        isBestAnswer: solved,
      },
      {
        id: "rep-2",
        author: "علی علیزاده",
        avatar: "/assets/behnaz.png",
        text: "من هم دقیقاً همین چالش رو روی پروژه قبلی داشتم. بعد از آپدیت فِرم‌ور به آخرین نسخه پایدار LTS مشکل کاملاً برطرف شد.",
        likes: 9,
        date: "۵ ساعت پیش",
        isBestAnswer: false,
      },
      {
        id: "rep-3",
        author: "سامان شبکه",
        avatar: "/assets/hooman.png",
        text: "اگر امکانش هست لاگ سیستم رو بفرستید تا دقیق‌تر بشه نظر داد.",
        likes: 4,
        date: "دیروز",
        isBestAnswer: false,
      },
    ];
  })();

  const [replies, setReplies] = useState(initialReplies);
  const [newReply, setNewReply] = useState("");
  const [likesCount, setLikesCount] = useState<number>(item.likes || 12);
  const [hasLiked, setHasLiked] = useState(false);

  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim()) return;
    const added = {
      id: `rep-${Date.now()}`,
      author: "شما (عضو انجمن)",
      avatar: "/assets/hooman.png",
      text: newReply.trim(),
      likes: 1,
      date: "لحظاتی پیش",
      isBestAnswer: false,
    };
    setReplies([added, ...replies]);
    setNewReply("");
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10" dir="rtl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 tb-text-sm text-[var(--tb-fg-muted)]">
        <Link href="/" className="hover:text-[var(--tb-fg-primary)]">خانه</Link>
        <span>/</span>
        <Link href="/forum" className="hover:text-[var(--tb-fg-primary)]">انجمن تکباکس</Link>
        <span>/</span>
        <span className="truncate text-[var(--tb-fg-primary)] max-w-xs">{item.title}</span>
      </nav>

      {/* Main Topic Question Card - NO generic top image */}
      <article className="card p-6 sm:p-8 space-y-6 shadow-md border-[var(--tb-border)]">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--tb-border)] pb-6">
          <div className="flex items-center gap-4">
            <Image
              src={item.author?.avatar || "/assets/hooman.png"}
              alt={item.author?.name || "نویسنده"}
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-[var(--tb-border)]"
            />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-[var(--tb-fg-primary)]">{item.title}</h1>
                {solved ? (
                  <span className="rounded-full bg-[color-mix(in_oklch,var(--tb-success)_15%,transparent)] border border-[color-mix(in_oklch,var(--tb-success)_30%,transparent)] px-3 py-1 text-xs font-bold text-[var(--tb-success)]">
                    حل‌شده ✓
                  </span>
                ) : (
                  <span className="rounded-full bg-[color-mix(in_oklch,var(--tb-warning)_15%,transparent)] border border-[color-mix(in_oklch,var(--tb-warning)_30%,transparent)] px-3 py-1 text-xs font-bold text-[var(--tb-warning)]">
                    باز
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 tb-text-sm text-[var(--tb-fg-muted)]">
                <span>ارسال‌شده توسط <b className="text-[var(--tb-fg-primary)]">{item.author?.name || "کاربر انجمن"}</b></span>
                <span>•</span>
                <span>{item.date_fa}</span>
                <span>•</span>
                <span>{item.views?.toLocaleString("fa-IR") || "۲۴۰"} بازدید</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setLikesCount((prev) => (hasLiked ? prev - 1 : prev + 1));
                setHasLiked(!hasLiked);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-[var(--tb-radius-full)] border font-bold transition-all ${
                hasLiked
                  ? "bg-[var(--tb-forum)]/15 border-[var(--tb-forum)] text-[var(--tb-forum)] shadow-sm"
                  : "bg-[var(--tb-bg-secondary)] border-[var(--tb-border)] text-[var(--tb-fg-primary)] hover:border-[var(--tb-forum)]"
              }`}
            >
              <Icon name="like" size={16} className={hasLiked ? "fill-current" : ""} />
              <span>{likesCount.toLocaleString("fa-IR")} رای</span>
            </button>
          </div>
        </header>

        {/* Problem Paragraph Sent by User */}
        <div className="prose max-w-none leading-8 text-[15px] text-[var(--tb-fg-primary)] whitespace-pre-line">
          {item.content || item.excerpt || "توضیحات تکمیلی برای این پرسش ثبت نشده است."}
        </div>

        {/* Tags kept hidden systematically as requested */}
      </article>

      {/* Replies & Solutions Section */}
      <section className="mt-8 space-y-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-black text-[var(--tb-fg-primary)]">
            پاسخ‌ها و راه‌حل‌ها ({replies.length.toLocaleString("fa-IR")})
          </h2>
          <span className="tb-text-sm text-[var(--tb-fg-muted)]">مرتب‌شده بر اساس بهترین پاسخ</span>
        </div>

        {/* New Reply Form */}
        <form onSubmit={handleAddReply} className="card p-5 space-y-3 bg-[var(--tb-bg-secondary)]/60">
          <h3 className="tb-text-md font-bold">ارسال پاسخ یا راه‌حل شما</h3>
          <textarea
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="اگر تجربه، راهکار یا پیشنهادی برای حل این موضوع دارید بنویسید..."
            className="input w-full min-h-[110px] tb-text-sm"
            required
          />
          <div className="flex justify-end">
            <Button type="submit" className="px-6 font-bold">ارسال پاسخ</Button>
          </div>
        </form>

        {/* Replies List */}
        <div className="space-y-4">
          {replies.map((reply) => (
            <div
              key={reply.id}
              className={`card p-6 transition-all ${
                reply.isBestAnswer
                  ? "border-2 border-[color-mix(in_oklch,var(--tb-success)_60%,transparent)] bg-[color-mix(in_oklch,var(--tb-success)_7%,var(--tb-bg-secondary))] shadow-md"
                  : "bg-[var(--tb-bg-secondary)] border-[var(--tb-border)]"
              }`}
            >
              {reply.isBestAnswer && (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--tb-success)]/15 border border-[var(--tb-success)]/30 px-3.5 py-1 text-xs font-bold text-[var(--tb-success)]">
                  <Icon name="check" size={14} className="stroke-[2.5]" />
                  <span>پاسخ انتخابی توسط ایجادکننده موضوع</span>
                </div>
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Image src={reply.avatar} alt={reply.author} width={44} height={44} className="h-11 w-11 rounded-full object-cover ring-1 ring-[var(--tb-border)]" />
                  <div>
                    <div className="font-bold text-[var(--tb-fg-primary)]">{reply.author}</div>
                    <div className="tb-text-sm text-[var(--tb-fg-muted)] mt-0.5">{reply.date}</div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--tb-bg-muted)] border border-[var(--tb-border)] tb-text-sm text-[var(--tb-fg-muted)] font-bold">
                  <span>▲</span>
                  <span>{reply.likes.toLocaleString("fa-IR")}</span>
                </div>
              </div>

              <p className="mt-4 text-[14px] leading-7 text-[var(--tb-fg-primary)] whitespace-pre-line pl-2">
                {reply.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
