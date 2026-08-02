"use client";

import Link from "next/link";
import type { ContentItem } from "@/lib/content";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AuthorLink } from "@/components/ui/author-link";
import { RelativeDate } from "@/components/ui/relative-date";
import { ShareButton } from "@/components/ui/share-button";
import CommentSection from "@/features/comment/components/CommentSection";
import { CheckCircle2, ExternalLink, MessageCircle, X } from "lucide-react";

type ForumTopicModalProps = {
  topic: ContentItem & { solved?: boolean };
  onClose: () => void;
};

/** Full forum thread in a homepage reply modal, with a normal route as exit. */
export function ForumTopicModal({ topic, onClose }: ForumTopicModalProps) {
  const fullPageHref = `/${topic.module}/${topic.slug}`;
  const body = topic.content?.trim() || topic.excerpt?.trim() || "";

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        dir="rtl"
        showCloseButton={false}
        className="h-[min(92svh,920px)] max-h-[92svh] max-w-[calc(100%-1rem)] gap-0 overflow-hidden p-0 sm:max-w-[min(980px,calc(100%-4rem))]"
      >
        <DialogTitle className="sr-only">{topic.title}</DialogTitle>
        <DialogDescription className="sr-only">موضوع کامل انجمن و پاسخ‌های آن</DialogDescription>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain" style={{ scrollbarWidth: "thin" }}>
          <article className="border-b border-border px-5 py-6 sm:px-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {topic.category && <p className="text-[12px] font-bold text-primary">{topic.category}</p>}
                <h2 className="mt-1 text-[22px] font-extrabold leading-[34px] text-foreground sm:text-[28px] sm:leading-[42px]">
                  {topic.title}
                </h2>
              </div>
              <DialogClose
                render={<Button type="button" variant="ghost" size="icon" aria-label="بستن موضوع" className="shrink-0" />}
              >
                <X className="size-5" aria-hidden="true" />
              </DialogClose>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <AuthorLink
                name={topic.author?.name}
                username={topic.author?.username}
                avatar={topic.author?.avatar}
                role={topic.author?.job || topic.author?.role}
                verifiedType={topic.author?.verifiedType}
                verifiedLabel={topic.author?.verifiedLabel}
              />
              <RelativeDate date={topic.date} label="تاریخ ایجاد موضوع" className="text-[12px] text-muted-foreground" />
              {topic.solved && (
                <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[var(--hp-solved)]">
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  حل‌شده
                </span>
              )}
            </div>

            {body && <p className="mt-5 whitespace-pre-wrap text-[15px] leading-7 text-muted-foreground">{body}</p>}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <ShareButton url={fullPageHref} label="اشتراک‌گذاری" />
              <Link
                href={fullPageHref}
                onClick={onClose}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-[var(--hp-r-sm)] px-2 text-[13px] font-bold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ExternalLink className="size-4" aria-hidden="true" />
                باز کردن در صفحهٔ کامل
              </Link>
            </div>
          </article>

          <section className="px-5 pb-8 sm:px-8" aria-label="پاسخ‌های موضوع">
            <h3 className="flex items-center gap-2 pt-6 text-[14px] font-extrabold text-foreground">
              <MessageCircle className="size-4 text-primary" aria-hidden="true" />
              پاسخ‌ها و گفتگو
            </h3>
            <CommentSection module="forum" slug={topic.slug} initialComments={topic.comments ?? 0} />
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ForumTopicModal;
