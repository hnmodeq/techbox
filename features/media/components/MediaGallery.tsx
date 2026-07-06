"use client";
import { getModuleItems } from "@/lib/content";
import { MediaSelectorCard } from "@/components/ui/media-selector-card";
import { useState, useMemo } from "react";
import ModuleHeader from "@/components/effects/ModuleHeader";
import { createPortal } from "react-dom";
import { zIndex } from "@/design";
import { Icon } from "@/design/icons";
import { CardStats } from "@/components/ui/card-stats";
import { LikeButton } from "@/components/ui/like-button";
import CommentSection from "@/features/comment/components/CommentSection";

const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export default function MediaGallery() {
  const allItems = useMemo(() => {
    const raw = getModuleItems("media");
    // Ensure we have enough items to demonstrate pagination cleanly
    return raw.length >= 8 ? raw : [...raw, ...raw, ...raw];
  }, []);

  const [activeVideo, setActiveVideo] = useState<any | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(allItems.length / itemsPerPage));
  const displayedItems = allItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12" dir="rtl">
      <ModuleHeader module="media" title="رسانه ویدیویی تکباکس" count={`${allItems.length.toLocaleString("fa-IR")} ویدیو`} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {displayedItems.map((v, idx) => (
          <MediaSelectorCard
            key={`${v.slug}-${idx}`}
            slug={v.slug}
            image={v.image}
            title={v.title}
            category={v.category}
            author={v.author?.name}
            dateFa={v.date_fa}
            views={v.views}
            likes={v.likes}
            comments={0}
            onClick={() => setActiveVideo(v)}
          />
        ))}
      </div>

      {/* Numeric Pagination (1 2 3 4) */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-10 w-10 rounded-[var(--corner-radius)] border font-bold transition-all ${
                page === p
                  ? "bg-[var(--media)] text-[#ffffff] border-[var(--media)] shadow-[var(--shadow-size)] scale-105"
                  : "border-[var(--border-color)] bg-[var(--card-background)] text-[var(--primary-text)] hover:border-[var(--media)] hover:text-[var(--media)]"
              }`}
            >
              {p.toLocaleString("fa-IR")}
            </button>
          ))}
        </div>
      )}

      {/* Pop-up Modal Video Player */}
      {activeVideo && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-6" style={{ zIndex: zIndex.modal }} dir="rtl">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setActiveVideo(null)} />

          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--modal-background)] shadow-[var(--shadow-size)] flex flex-col" style={{ zIndex: zIndex.modalContent }}>
            <div className="flex items-center justify-between p-4 border-b-[length:var(--border-size)] border-[var(--border-color)]">
              <h3 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold font-bold truncate text-[var(--primary-text)]">{activeVideo.title}</h3>
              <button
                onClick={() => setActiveVideo(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--muted-background)] paragraph-color hover:text-[var(--primary-text)] transition-colors"
                aria-label="بستن"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="relative aspect-video bg-black shrink-0">
              <video
                key={activeVideo.slug}
                controls
                autoPlay
                playsInline
                poster={activeVideo.image}
                className="w-full h-full object-contain bg-black"
                src={SAMPLE_VIDEO}
              />
            </div>

            <div className="p-5 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b-[length:var(--border-size)] border-[var(--border-color)] pb-4">
                <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color flex items-center gap-3">
                  <span>منتشرشده توسط: <b className="text-[var(--primary-text)]">{activeVideo.author?.name || "تکباکس"}</b></span>
                  <span>•</span>
                  <span>{activeVideo.date_fa}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color bg-[var(--card-background)] px-3 py-1.5 rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)]">
                    <CardStats module="media" slug={activeVideo.slug} initialViews={activeVideo.views ?? 0} initialLikes={activeVideo.likes ?? 0} showLabel={true} />
                  </span>

                  <LikeButton contentType="media" slug={activeVideo.slug} initial={activeVideo.likes ?? 0} />
                </div>
              </div>

              {/* Real, database-backed comments (persist across refreshes). */}
              <CommentSection module="media" slug={activeVideo.slug} />
            </div>
          </div>
        </div>,
        document.body
      )}
    </main>
  );
}
