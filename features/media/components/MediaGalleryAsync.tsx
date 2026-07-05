'use client';
import { ContentItem } from "@/lib/content";
import { MediaSelectorCard } from "@/components/ui/media-selector-card";
import { useState, useMemo } from "react";
import ModuleHeader from "@/components/effects/ModuleHeader";
import { createPortal } from "react-dom";
import { zIndex } from "@/design";
import { Icon } from "@/design/icons";
import { CardStats } from "@/components/ui/card-stats";

const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export default function MediaGalleryAsync({ items }: { items: ContentItem[] }) {
  const [active, setActive] = useState<ContentItem | null>(null);

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-8 py-14" dir="rtl">
      <ModuleHeader module="media" title="رسانه ویدیویی تکباکس" description={`ویدیوها، ریلزها و محتوای چندرسانه‌ای • ${items.length.toLocaleString("fa-IR")} ویدیو`} />
      
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((v) => (
          <button key={v.slug} type="button" onClick={() => setActive(v)} className="group relative w-full aspect-[9/16] rounded-[var(--corner-radius)] overflow-hidden border-[length:var(--border-size)] border-[var(--border-color)] shadow-[var(--shadow-size)] hover:shadow-[var(--shadow-size)] transition-all duration-[200ms] bg-[var(--card-background)] flex flex-col justify-end text-right cursor-pointer">
            <MediaSelectorCard item={v} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-white transition-transform group-hover:scale-125 shadow-[var(--shadow-size)]">▶</div>
            </div>
            <div className="relative z-30 p-3.5 text-white w-full">
              <h3 className="text-xs sm:text-sm font-bold leading-5 line-clamp-2 text-white group-hover:text-[var(--media)] transition-colors">{v.title}</h3>
              <div className="mt-2"><CardStats module="media" slug={v.slug} initialViews={v.views ?? 0} initialLikes={v.likes ?? 0} showComments={true} /></div>
            </div>
          </button>
        ))}
      </div>

      {active && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-6" style={{ zIndex: zIndex.modal }} dir="rtl">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setActive(null)} />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--modal-background)] shadow-[var(--shadow-size)] flex flex-col" style={{ zIndex: zIndex.modalContent }}>
            <div className="flex items-center justify-between p-4 border-b-[length:var(--border-size)] border-[var(--border-color)]">
              <h3 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold truncate text-[var(--primary-text)]">{active.title}</h3>
              <button type="button" onClick={() => setActive(null)} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--muted-background)] paragraph-color hover:text-[var(--primary-text)] cursor-pointer"><Icon name="close" size={18} /></button>
            </div>
            <div className="relative aspect-video bg-black shrink-0">
              <video key={active.slug} controls autoPlay playsInline poster={active.image} className="w-full h-full object-contain bg-black" src={SAMPLE_VIDEO} />
            </div>
          </div>
        </div>,
        document.body
      )}
    </main>
  );
}