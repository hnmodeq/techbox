'use client';

import React from 'react';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import { TimelineContainer, TimelineLoading, TimelineError } from '@/features/timeline/components';
import { useTimelineEvents } from '@/features/timeline/hooks';
import { useModuleTitle } from '@/providers/module-config.provider';
import type { TimelineEvent } from '@/types/timeline';

function ActiveTimelineContent({
  events,
  isLoading,
  error,
}: {
  events: TimelineEvent[];
  isLoading: boolean;
  error: string | null;
}) {
  if (isLoading) return <TimelineLoading />;
  if (error || !events || events.length === 0) return <TimelineError error={error || 'رویدادی یافت نشد'} />;

  return <TimelineContainer events={events} heightClassName="h-[560px]" />;
}

export default function HomeTimelineRow({ homeTitle, homeMoreLabel, showHomeTitle = true, showHomeMoreLabel = true }: { homeTitle?: string; homeMoreLabel?: string; showHomeTitle?: boolean; showHomeMoreLabel?: boolean }) {
  const { events, isLoading, error } = useTimelineEvents();
  // Read the module title from the source of truth (so the h2 follows admin
  // renames). Fallback to a sensible default.
  const timelineTitle = useModuleTitle('timeline', 'گاه‌شمار تکنولوژی');

  return (
    <section className={`w-full py-8 ${HOME_ROW_SIZES.timelineMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full px-4 sm:px-6 lg:px-8 space-y-6`}>
        <div className="flex items-center justify-between gap-4 mb-2">
          {showHomeTitle && <h2 className="text-xl sm:text-2xl font-black text-foreground">{homeTitle || timelineTitle}</h2>}
          {showHomeMoreLabel && (
            <Link
              href="/timeline"
              className="text-sm font-bold text-primary hover:underline flex items-center gap-1 shrink-0"
            >
              <span>{homeMoreLabel || "ورود به تایم‌لاین کامل"}</span>
              <span>←</span>
            </Link>
          )}
        </div>

        {/* The real timeline panel — same frame before and after. No preview
            state, no click-to-activate. The user scrolls immediately. */}
        <div className="w-full">
          <ActiveTimelineContent events={events} isLoading={isLoading} error={error} />
        </div>
      </div>
    </section>
  );
}
