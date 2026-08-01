"use client";

/**
 * Full News discussion modal.
 *
 * Homepage comment rows are deliberately lightweight previews. Selecting one
 * opens this focused view: the whole short-form News post plus the same live
 * CommentSection used on the dedicated page. The selected preview comment is
 * passed through so the thread can reveal and spotlight it after loading.
 */
import Link from "next/link";
import type { ContentItem } from "@/lib/content";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RemoteImage } from "@/components/ui/remote-image";
import { AuthorLink } from "@/components/ui/author-link";
import { RelativeDate } from "@/components/ui/relative-date";
import { ShareButton } from "@/components/ui/share-button";
import CommentSection from "@/features/comment/components/CommentSection";
import { ExternalLink, MessageCircle, X } from "lucide-react";

export type NewsModalProps = {
  story: ContentItem;
  selectedCommentId?: string | null;
  onClose: () => void;
};

export function NewsModal({ story, selectedCommentId, onClose }: NewsModalProps) {
  const fullPageHref = `/${story.module}/${story.slug}`;
  const body = story.content?.trim() || story.excerpt?.trim() || "";
  const tags = Array.isArray(story.tags) ? story.tags : [];

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        dir="rtl"
        showCloseButton={false}
        className="h-[min(92svh,920px)] max-h-[92svh] max-w-[calc(100%-1rem)] gap-0 overflow-hidden p-0 sm:max-w-[min(1080px,calc(100%-4rem))]"
      >
        <DialogTitle className="sr-only">{story.title}</DialogTitle>
        <DialogDescription className="sr-only">
          خبر کامل و گفتگوی خوانندگان
        </DialogDescription>

        <div className="relative shrink-0 overflow-hidden bg-muted max-sm:h-44 sm:h-64">
          {story.image ? (
            <RemoteImage
              src={story.image}
              alt={story.title}
              sizes="(min-width: 640px) 1080px, 100vw"
              priority
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/20" />

          <DialogClose
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute start-4 top-4 text-white hover:bg-white/15 hover:text-white"
                aria-label="بستن گفتگوی خبر"
              />
            }
          >
            <X className="size-5" aria-hidden="true" />
          </DialogClose>

          <div className="absolute inset-x-5 bottom-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-white/85">
            <RelativeDate date={story.date} label="تاریخ انتشار" className="text-white/85" />
            {story.source && (
              <>
                <span aria-hidden="true">•</span>
                <span>منبع: {story.source}</span>
              </>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" style={{ scrollbarWidth: "thin" }}>
          <article className="border-b border-border px-5 py-6 sm:px-8">
            <h2 className="text-[22px] font-extrabold leading-[34px] text-foreground sm:text-[28px] sm:leading-[42px]">
              {story.title}
            </h2>

            <div className="mt-4">
              <AuthorLink
                name={story.author?.name}
                username={story.author?.username}
                avatar={story.author?.avatar}
                role={story.author?.job || story.author?.role}
                verifiedType={story.author?.verifiedType}
                verifiedLabel={story.author?.verifiedLabel}
              />
            </div>

            {body && (
              <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-muted-foreground">
                {body}
              </p>
            )}

            {tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    onClick={onClose}
                    className="rounded-[var(--hp-r-sm)] border border-border px-2.5 py-1 text-[12px] font-semibold text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <ShareButton url={fullPageHref} label="اشتراک‌گذاری" />
              <Link
                href={fullPageHref}
                onClick={onClose}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-[var(--hp-r-sm)] px-2 text-[13px] font-bold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ExternalLink className="size-4" aria-hidden="true" />
                صفحهٔ خبر
              </Link>
            </div>
          </article>

          <section className="px-5 pb-8 sm:px-8" aria-label="گفتگوی خوانندگان">
            <div className="flex items-center gap-2 pt-6 text-[14px] font-extrabold text-foreground">
              <MessageCircle className="size-4 text-primary" aria-hidden="true" />
              گفتگوی خوانندگان
              {(story.comments ?? 0) > 0 && (
                <span className="font-semibold text-muted-foreground">
                  ({(story.comments ?? 0).toLocaleString("fa-IR")})
                </span>
              )}
            </div>

            <CommentSection
              module="news"
              slug={story.slug}
              initialComments={story.comments ?? 0}
              scrollToCommentId={selectedCommentId}
            />
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default NewsModal;
