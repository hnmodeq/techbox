"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/design/icons";
import { LiveViewCounter } from "@/components/ui/live-view-counter";
import { ForumBadge } from "@/components/ui/forum-badge";
import { LikeButton } from "@/components/ui/like-button";
import CommentSection from "@/features/comment/components/CommentSection";

type ForumDetailProps = {
  item: any;
};

export default function ForumDetail({ item }: ForumDetailProps) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10" dir="rtl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
        <Link href="/" className="hover:text-[var(--primary-text)]">
          خانه
        </Link>
        <span>/</span>
        <Link href="/forum" className="hover:text-[var(--primary-text)]">
          انجمن تکباکس
        </Link>
        <span>/</span>
        <span className="truncate text-[var(--primary-text)] max-w-xs">{item.title}</span>
      </nav>

      {/* Main Topic Question Card */}
      <article className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-6 sm:p-8 space-y-6">
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
                <ForumBadge slug={item.slug} fallback={null} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
                <span>
                  ارسال‌شده توسط{" "}
                  <b className="text-[var(--primary-text)]">{item.author?.name || "کاربر انجمن"}</b>
                </span>
                <span>•</span>
                <span>{item.date_fa}</span>
                <span>•</span>
                <LiveViewCounter module="forum" slug={item.slug} showLabel={true} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LikeButton contentType="forum" slug={item.slug} />
          </div>
        </header>

        {/* Problem Paragraph Sent by User */}
        <div className="prose max-w-none leading-8 text-[15px] text-[var(--primary-text)] whitespace-pre-line">
          {item.content || item.excerpt || "توضیحات تکمیلی برای این پرسش ثبت نشده است."}
        </div>
      </article>

      {/* Replies & Solutions Section — backed by the database, so replies and
          new answers persist across refreshes (no more mock data / local-only
          state). */}
      <CommentSection module="forum" slug={item.slug} />
    </main>
  );
}
