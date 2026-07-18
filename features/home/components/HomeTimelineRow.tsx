'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { TimelineContainer, TimelineLoading, TimelineError } from '@/features/timeline/components';
import { useTimelineEvents, useTimelineZoom, usePan } from '@/features/timeline/hooks';
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

/** Single preview image that fades in only once decoded. Before load it is
 * fully transparent (no border, no background, no box) so there is NO second
 * skeleton stage — just the neutral grid background + title, then a smooth
 * fade-in when the photo is actually ready. */
function TimelinePreviewImage({ src, alt, priority }: { src: string; alt: string; priority?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 33vw, 16vw"
        {...(priority ? { priority: true } : {})}
        onLoad={() => setLoaded(true)}
        className={`object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
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

  useEffect(() => {
    if (events.length === 0) return;
    const withImages = events.filter((e) => !!e.image);
    if (withImages.length === 0) return;
    setPreview(pickRandom(withImages, PREVIEW_COUNT));
  }, [events]);

  return (
    <section className={`w-full py-8 ${HOME_ROW_SIZES.timelineMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full px-4 sm:px-6 lg:px-8 space-y-6`}>
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
              <div className="relative grid grid-cols-3 gap-2 sm:grid-cols-6 min-h-[200px] bg-muted/40">
                {preview.map((p, idx) => (
                  <TimelinePreviewImage key={p.id} src={p.image!} alt={p.title} priority={idx < 3} />
                ))}
                {/* Gradient overlay so the (larger, no-bg) title reads clearly
                    over the image grid, which now reads as a background. */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/45 via-black/25 to-black/45" />

                {/* Centered title (no button background). Morphs SLOWLY into a
                    "click to watch" prompt on hover. The title is the default
                    in every state — including loading — so there's no flash of
                    the wrong string. Both texts are stacked and crossfaded. */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
                  <div className="relative flex items-center justify-center [filter:drop-shadow(0_2px_10px_rgba(0,0,0,0.55))]">
                    <span className="text-xl sm:text-3xl font-black text-white whitespace-nowrap transition-all duration-700 ease-in-out opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-90 group-hover:-translate-y-3">
                      تایم‌لاین فناوری
                    </span>
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
