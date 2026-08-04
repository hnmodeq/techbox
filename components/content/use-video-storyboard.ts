"use client";

import * as React from "react";

export function useVideoStoryboard(frames?: string[] | null) {
  const usable = React.useMemo(
    () => (frames ?? []).filter((frame) => typeof frame === "string" && frame.startsWith("https://")).slice(0, 12),
    [frames],
  );
  const [index, setIndex] = React.useState<number | null>(null);
  const timer = React.useRef<number | null>(null);
  const preloaded = React.useRef(false);

  const stop = React.useCallback(() => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
    setIndex(null);
  }, []);

  const start = React.useCallback((event: React.PointerEvent) => {
    if (event.pointerType && event.pointerType !== "mouse") return;
    if (usable.length < 2 || timer.current !== null) return;
    if (!preloaded.current) {
      usable.forEach((src) => { const image = new window.Image(); image.src = src; });
      preloaded.current = true;
    }
    setIndex(0);
    timer.current = window.setInterval(() => {
      setIndex((current) => current === null ? 0 : (current + 1) % usable.length);
    }, 220);
  }, [usable]);

  React.useEffect(() => stop, [stop]);

  return {
    frame: index === null ? null : usable[index] ?? null,
    handlers: {
      onPointerEnter: start,
      onPointerLeave: stop,
      onPointerCancel: stop,
    },
    available: usable.length >= 2,
  };
}
