"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type LikesStatus = "loading" | "ready" | "error";

type TimelineLikesContextValue = {
  likedIds: Set<string>;
  status: LikesStatus;
  setLiked: (eventId: string, liked: boolean) => void;
};

const TimelineLikesContext = createContext<TimelineLikesContextValue>({
  likedIds: new Set(),
  status: "loading",
  setLiked: () => {}
});

/**
 * Fetches which timeline events the CURRENT user has liked in a single
 * bulk request (/api/timeline/liked-events), instead of every TimelineCard
 * on the page firing its own GET /api/timeline/like?eventId=X just to find
 * out its own "liked" state. Public like counts/comments come from the
 * bulk /api/timeline/events payload already.
 */
export function TimelineLikesProvider({ children }: { children: ReactNode }) {
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<LikesStatus>("loading");

  useEffect(() => {
    let mounted = true;
    fetch("/api/timeline/liked-events", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (data && Array.isArray(data.likedEventIds)) {
          setLikedIds(new Set(data.likedEventIds));
          setStatus("ready");
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        if (mounted) setStatus("error");
      });
    return () => { mounted = false; };
  }, []);

  const setLiked = useCallback((eventId: string, liked: boolean) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (liked) next.add(eventId);
      else next.delete(eventId);
      return next;
    });
  }, []);

  return (
    <TimelineLikesContext.Provider value={{ likedIds, status, setLiked }}>
      {children}
    </TimelineLikesContext.Provider>
  );
}

export function useTimelineLiked(eventId: string): { liked: boolean; status: LikesStatus; setLiked: (liked: boolean) => void } {
  const { likedIds, status, setLiked } = useContext(TimelineLikesContext);
  return {
    liked: likedIds.has(eventId),
    status,
    setLiked: (liked: boolean) => setLiked(eventId, liked)
  };
}
