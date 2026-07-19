'use client';

import { TimelineContainer, TimelineLoading, TimelineError } from '@/features/timeline/components';
import { useTimelineEvents } from '@/features/timeline/hooks';
import { TimelineLikesProvider } from '@/providers/timeline-likes.provider';

export default function TimelinePage() {
  const { events, isLoading, error } = useTimelineEvents();

  if (isLoading) return <TimelineLoading />;
  if (error) return <TimelineError error={error} />;
  if (!events || events.length === 0) return <TimelineError error="هیچ رویدادی یافت نشد" />;

  return (
    // Scoped here (rather than globally in LayoutShell) since only /timeline
    // needs to know which events the current user liked.
    <TimelineLikesProvider>
      <main className="w-full">
        <TimelineContainer events={events} heightClassName="h-[calc(100svh-var(--header-height))]" />
      </main>
    </TimelineLikesProvider>
  );
}
