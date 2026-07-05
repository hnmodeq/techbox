"use client";
import { getModuleItems } from "@/lib/content";
import { MediaSelectorCard } from "@/components/ui/MediaSelectorCard";
import { useState, useMemo } from "react";
import ModuleHeader from "@/components/effects/ModuleHeader";
import { createPortal } from "react-dom";
import { zIndex } from "@/design";
import { Icon } from "@/design/icons";
import { CardStats } from "@/components/ui/CardStats";

const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export default function MediaGallery() {
  const allItems = useMemo(() => {
    const raw = getModuleItems("media");
    // Ensure we have enough items to demonstrate pagination cleanly
    return raw.length >= 8 ? raw : [...raw, ...raw, ...raw];
  }, []);

  const [activeVideo, setActiveVideo] = useState<any | null>(null);
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [likedList, setLikedList] = useState<Record<string, boolean>>({});
  const [commentsList, setCommentsList] = useState<Record<string, string[]>>({
    default: ["ویدیو بسیار عالی و کاربردی بود، ممنون از تکباکس!", "لطفاً قسمت دوم این آموزش رو هم بسازید."],
  });
  const [newComment, setNewComment] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(allItems.length / itemsPerPage));
  const displayedItems = allItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getLikes = (slug: string, initial: number) => {
    return likesMap[slug] !== undefined ? likesMap[slug] : initial;
  };

  const handleLike = (slug: string, initial: number) => {
    const current = getLikes(slug, initial);
    const isLiked = likedList[slug];
    setLikesMap({ ...likesMap, [slug]: isLiked ? current - 1 : current + 1 });
    setLikedList({ ...likedList, [slug]: !isLiked });
  };

  const getComments = (slug: string) => {
    return commentsList[slug] || commentsList.default;
  };

  const handleAddComment = (e: React.FormEvent, slug: string) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const prev = getComments(slug);
    setCommentsList({ ...commentsList, [slug]: [...prev, newComment.trim()] });
    setNewComment("");
  };

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
            likes={getLikes(v.slug, v.likes)}
            comments={getComments(v.slug).length}
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
                  ? "bg-[var(--media)] text-[#ffffff] border-[var(--media)] shadow-md scale-105"
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
          
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[var(--corner-radius)] border border-[var(--border-color)] bg-[var(--main-background)] shadow-2xl flex flex-col" style={{ zIndex: zIndex.modalContent }}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
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
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
                <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color flex items-center gap-3">
                  <span>منتشرشده توسط: <b className="text-[var(--primary-text)]">{activeVideo.author?.name || "تکباکس"}</b></span>
                  <span>•</span>
                  <span>{activeVideo.date_fa}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color bg-[var(--card-background)] px-3 py-1.5 rounded-[var(--corner-radius)] border border-[var(--border-color)]">
                    <CardStats module="media" slug={activeVideo.slug} initialViews={activeVideo.views ?? 0} initialLikes={activeVideo.likes ?? 0} showLabel={true} />
                  </span>

                  <button
                    onClick={() => handleLike(activeVideo.slug, activeVideo.likes)}
                    className={`inline-flex items-center gap-1.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] px-4 py-1.5 rounded-[var(--corner-radius)] border transition-all ${
                      likedList[activeVideo.slug]
                        ? "bg-[var(--tb-danger)]/15 border-[var(--tb-danger)] text-[var(--tb-danger)] shadow-sm"
                        : "bg-[var(--card-background)] border-[var(--border-color)] text-[var(--primary-text)] hover:border-[var(--tb-danger)]"
                    }`}
                  >
                    <Icon name="like" size={16} className={likedList[activeVideo.slug] ? "fill-current" : ""} />
                    <span>{getLikes(activeVideo.slug, activeVideo.likes).toLocaleString("fa-IR")} پسند</span>
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-4">
                <h4 className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold font-bold">نظرات کاربران ({getComments(activeVideo.slug).length.toLocaleString("fa-IR")})</h4>

                <form onSubmit={(e) => handleAddComment(e, activeVideo.slug)} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="نظر خود را درباره این ویدیو بنویسید..."
                    className="input flex-1 !h-11 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]"
                  />
                  <button type="submit" className="btn btn-primary !h-11 px-6 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] shrink-0">
                    ارسال نظر
                  </button>
                </form>

                <ul className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {getComments(activeVideo.slug).map((c, i) => (
                    <li key={i} className="p-3 rounded-[var(--corner-radius)] bg-[var(--card-background)] border border-[var(--border-color)] text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">
                      <div className="flex items-center justify-between mb-1 text-[12px] paragraph-color">
                        <b>کاربر تکباکس</b>
                        <span>لحظاتی پیش</span>
                      </div>
                      <p className="text-[var(--primary-text)]">{c}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </main>
  );
}
