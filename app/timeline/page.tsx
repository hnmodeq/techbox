'use client';

import { TimelineContainer, TimelineLoading, TimelineError } from '@/features/timeline/components';
import { useTimelineEvents } from '@/features/timeline/hooks';

export default function TimelinePage() {
  const { events, isLoading, error } = useTimelineEvents();

  if (isLoading) return <TimelineLoading />;
  if (error) return <TimelineError error={error} />;
  if (!events || events.length === 0) return <TimelineError error="هیچ رویدادی یافت نشد" />;

  return (
    <main className="w-full">
      <TimelineContainer events={events} heightClassName="h-[calc(100svh-var(--header-height))]" />
    </main>
  );
}
