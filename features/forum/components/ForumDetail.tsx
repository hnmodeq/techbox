"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/design/icons";
import { LiveViewCounter } from "@/components/ui/live-view-counter";
import { ForumBadge } from "@/components/ui/forum-badge";
import { LikeButton } from "@/components/ui/like-button";
import commentsData from "@/prisma/mock-data/comments.json";
import { Button } from "@/components/ui/button";

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
      <nav className="mb-6 flex items-center gap-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
        <Link href="/" className="hover:text-[var(--primary-text)]">خانه</Link>
        <span>/</span>
        <Link href="/forum" className="hover:text-[var(--primary-text)]">انجمن تکباکس</Link>
        <span>/</span>
        <span className="truncate text-[var(--primary-text)] max-w-xs">{item.title}</span>
      </nav>

      {/* Main Topic Question Card - NO generic top image */}
      <article className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-6 sm:p-8 space-y-6 shadow-[var(--shadow-size)] border-[var(--border-color)]">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b-[length:var(--border-size)] border-[var(--border-color)] pb-6">
          <div className="flex items-center gap-4">
            <Image
              src={item.author?.avatar || "/assets/hooman.png"}
              alt={item.author?.name || "نویسنده"}
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-[var(--border-color)]"
            />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-[var(--primary-text)]">{item.title}</h1>
                <ForumBadge slug={item.slug} fallback={item.solved ?? false} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
                <span>ارسال‌شده توسط <b className="text-[var(--primary-text)]">{item.author?.name || "کاربر انجمن"}</b></span>
                <span>•</span>
                <span>{item.date_fa}</span>
                <span>•</span>
                <LiveViewCounter module="forum" slug={item.slug} initialViews={item.views ?? 0} showLabel={true} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LikeButton contentType="forum" slug={item.slug} initial={item.likes ?? 0} />
          </div>
        </header>

        {/* Problem Paragraph Sent by User */}
        <div className="prose max-w-none leading-8 text-[15px] text-[var(--primary-text)] whitespace-pre-line">
          {item.content || item.excerpt || "توضیحات تکمیلی برای این پرسش ثبت نشده است."}
        </div>

        {/* Tags kept hidden systematically as requested */}
      </article>

      {/* Replies & Solutions Section */}
      <section className="mt-8 space-y-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-black text-[var(--primary-text)]">
            پاسخ‌ها و راه‌حل‌ها ({replies.length.toLocaleString("fa-IR")})
          </h2>
          <span className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">مرتب‌شده بر اساس بهترین پاسخ</span>
        </div>

        {/* New Reply Form */}
        <form onSubmit={handleAddReply} className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-5 space-y-3 bg-[var(--card-background)]/60">
          <h3 className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold font-bold">ارسال پاسخ یا راه‌حل شما</h3>
          <textarea
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="اگر تجربه، راهکار یا پیشنهادی برای حل این موضوع دارید بنویسید..."
            className="input w-full min-h-[110px] text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]"
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
                  ? "border-[length:var(--border-size)] border-[color-mix(in_oklch,var(--success)_60%,transparent)] bg-[color-mix(in_oklch,var(--success)_7%,var(--card-background))] shadow-[var(--shadow-size)]"
                  : "bg-[var(--card-background)] border-[var(--border-color)]"
              }`}
            >
              {reply.isBestAnswer && (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--success)]/15 border-[length:var(--border-size)] border-[var(--success)]/30 px-3.5 py-1 text-xs font-bold text-[var(--success)]">
                  <Icon name="check" size={14} className="stroke-[2.5]" />
                  <span>پاسخ انتخابی توسط ایجادکننده موضوع</span>
                </div>
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Image src={reply.avatar} alt={reply.author} width={44} height={44} className="h-11 w-11 rounded-full object-cover ring-1 ring-[var(--border-color)]" />
                  <div>
                    <div className="font-bold text-[var(--primary-text)]">{reply.author}</div>
                    <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color mt-0.5">{reply.date}</div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--muted-background)] border-[length:var(--border-size)] border-[var(--border-color)] text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color font-bold">
                  <span>▲</span>
                  <span>{reply.likes.toLocaleString("fa-IR")}</span>
                </div>
              </div>

              <p className="mt-4 text-[14px] leading-7 text-[var(--primary-text)] whitespace-pre-line pl-2">
                {reply.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
