'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TimelineContainer, TimelineLoading, TimelineError } from '@/features/timeline/components';
import { useTimelineEvents, useTimelineZoom, usePan } from '@/features/timeline/hooks';
import { useModuleTitle } from '@/providers/module-config.provider';
import type { TimelineEvent } from '@/types/timeline';

const PREVIEW_COUNT = 6;

/** Pick N random items from an array (Fisher–Yates). Runs only on the client
 * (inside an effect), so there is no SSR hydration mismatch. */
function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

/** Single preview image. Stays invisible (opacity-0) until it decodes; the
 * parent swaps the whole grid from skeleton -> images only after ALL images
 * have reported load, so there is exactly one skeleton -> one reveal. */
function TimelinePreviewImage({ src, alt, priority, onLoaded }: { src: string; alt: string; priority?: boolean; onLoaded?: () => void }) {
  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 33vw, 16vw"
        {...(priority ? { priority: true } : {})}
        onLoad={() => onLoaded?.()}
        className="object-cover"
      />
    </div>
  );
}

/** The single skeleton: same grid layout + cell size as the final image grid,
 *  so height never jumps. Each cell uses `skeleton-base` which already carries
 *  the shimmer animation from globals.css. */
function TimelineGridSkeleton({ count = PREVIEW_COUNT }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
      ))}
    </div>
  );
}

function ActiveTimelineContent({
  events,
  isLoading,
  error,
}: {
  events: TimelineEvent[];
  isLoading: boolean;
  error: string | null;
}) {
  const { zoom, resetZoom, setZoom } = useTimelineZoom(1);
  const { pan, startPanning, stopPanning, handlePan, resetPan } = usePan({ x: 150, y: 0 });

  const handleResetView = useCallback(() => {
    resetZoom();
    resetPan();
  }, [resetZoom, resetPan]);

  if (isLoading) return <TimelineLoading />;
  if (error || !events || events.length === 0) return <TimelineError error={error || 'رویدادی یافت نشد'} />;

  return (
    <TimelineContainer
      events={events}
      zoom={zoom}
      pan={pan}
      onPanStart={startPanning}
      onPanMove={handlePan}
      onPanEnd={stopPanning}
      onResetView={handleResetView}
      onZoomChange={setZoom}
      onWheel={undefined}
      heightClassName="h-[520px]"
    />
  );
}

export default function HomeTimelineRow({ homeTitle, homeMoreLabel, showHomeTitle = true, showHomeMoreLabel = true }: { homeTitle?: string; homeMoreLabel?: string; showHomeTitle?: boolean; showHomeMoreLabel?: boolean }) {
  // Fetch once at the top level so the preview can use real event images and
  // the active timeline reuses them (no double fetch).
  const { events, isLoading, error } = useTimelineEvents();
  const [active, setActive] = useState(false);

  const [preview, setPreview] = useState<TimelineEvent[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const timelineTitle = useModuleTitle('timeline', 'گاه‌شمار تکنولوژی');
  const allImagesLoaded = preview.length > 0 && loadedCount >= preview.length;

  useEffect(() => {
    if (events.length === 0) return;
    const withImages = events.filter((e) => !!e.image);
    if (withImages.length === 0) return;
    setPreview(pickRandom(withImages, PREVIEW_COUNT));
  }, [events]);

  // Reset the load counter whenever a new random set is picked, so the skeleton
  // shows again until the new images report ready.
  useEffect(() => {
    setLoadedCount(0);
  }, [preview]);

  return (
    <section className={`w-full py-8 ${HOME_ROW_SIZES.timelineMinHeight} flex flex-col bg-white justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full bg-red-300 px-4 sm:px-6 lg:px-8 space-y-6`}>
        <div className="flex items-center justify-between gap-4 mb-2">
          {showHomeTitle && <h2 className="text-xl sm:text-2xl font-black text-foreground">{homeTitle || "گاه\u200Cشمار پیشرفت تکنولوژی"}</h2>}
          {showHomeMoreLabel && (
          <Link
            href="/timeline"
            className="text-sm font-bold text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            <span>{homeMoreLabel || "ورود به تایم\u200Cلاین کامل"}</span>
            <span>←</span>
          </Link>
          )}
        </div>

        {active && (
          <div className="text-center">
            <Badge variant="outline" className="bg-card px-4 py-1.5 text-xs font-bold text-primary shadow-sm">
              برای مشاهده رویدادهای تکنولوژی به چپ و راست حرکت کنید.
            </Badge>
          </div>
        )}

        <div className="w-full overflow-hidden rounded-xl">
          {!active ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() => setActive(true)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setActive(true);
                }
              }}
              className="group relative cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="بارگذاری تایم‌لاین تعاملی"
            >
              <div className="relative">
                {/* THE skeleton: identical grid + cell size as the images, so it
                    establishes the correct height from the very first paint
                    (even before events are fetched) and never jumps. It is the
                    single loading state — shimmering via skeleton-base — and
                    stays in place until ALL images report load, then crossfades
                    out. No separate row-skeleton, no bordered empty cells. */}
                <div className={`transition-opacity duration-700 ${allImagesLoaded ? 'opacity-0' : 'opacity-100'}`}>
                  <TimelineGridSkeleton count={Math.max(preview.length, PREVIEW_COUNT)} />
                </div>

                {/* Images grid — overlaid on top (absolute) so it doesn't change
                    the layout; invisible until every image is decoded, then
                    crossfades in. */}
                {preview.length > 0 && (
                  <div className={`absolute inset-0 grid grid-cols-3 gap-2 sm:grid-cols-6 transition-opacity duration-700 ${allImagesLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    {preview.map((p, idx) => (
                      <TimelinePreviewImage
                        key={p.id}
                        src={p.image!}
                        alt={p.title}
                        priority={idx < 3}
                        onLoaded={() => setLoadedCount((n) => n + 1)}
                      />
                    ))}
                  </div>
                )}

                {/* Gradient overlay so the no-bg title reads clearly over the
                    image grid (which now reads as a background). */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/50 transition-all duration-700 ease-in-out group-hover:from-black/85 group-hover:via-black/70 group-hover:to-black/85" />

                {/* Centered title (no button background). Morphs SLOWLY into a
                    "click to watch" prompt on hover. Title is the default in
                    every state. Both texts are stacked and crossfaded. */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
                  <div className="relative flex items-center justify-center [filter:drop-shadow(0_2px_10px_rgba(0,0,0,0.55))]">
                    <span className="text-xl sm:text-3xl font-black text-white whitespace-nowrap transition-all duration-700 ease-in-out opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-90 group-hover:-translate-y-3">{timelineTitle}</span>
                    <span className="absolute m-auto text-lg sm:text-2xl font-black text-white whitespace-nowrap transition-all duration-700 ease-in-out opacity-0 scale-110 group-hover:opacity-100 group-hover:scale-100">
                      برای تماشا کلیک کنید
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ActiveTimelineContent events={events} isLoading={isLoading} error={error} />
          )}
        </div>
      </div>
    </section>
  );
}
