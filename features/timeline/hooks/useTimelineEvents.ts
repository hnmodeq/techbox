'use client';

import { useState, useEffect } from 'react';
import { TimelineEvent } from '@/types/timeline';

export function useTimelineEvents() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/timeline/events', { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        const sorted = data.sort((a: TimelineEvent, b: TimelineEvent) => {
          return new Date(b.dateGr).getTime() - new Date(a.dateGr).getTime();
        });
        setEvents(sorted);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return { events, isLoading, error };
}
