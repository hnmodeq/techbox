'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const PREFIX = 'techbox-scroll:';

function getScrollKey() {
  return `${PREFIX}${window.location.pathname}${window.location.search}`;
}

function saveScroll(key = getScrollKey()) {
  sessionStorage.setItem(key, String(Math.max(0, Math.floor(window.scrollY))));
}

function restoreScroll(key = getScrollKey()) {
  const saved = sessionStorage.getItem(key);
  if (saved === null) return () => {};

  const scrollY = Number.parseInt(saved, 10);
  if (!Number.isFinite(scrollY)) return () => {};

  let cancelled = false;
  let frame = 0;
  const startedAt = performance.now();
  const maxWaitMs = 1800;

  const restore = () => {
    if (cancelled) return;

    const maxScrollableY = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    ) - window.innerHeight;
    const pageIsReady = maxScrollableY >= scrollY || performance.now() - startedAt > maxWaitMs;

    window.scrollTo(0, Math.min(scrollY, Math.max(0, maxScrollableY)));

    if (!pageIsReady || Math.abs(window.scrollY - scrollY) > 2) {
      frame = requestAnimationFrame(restore);
    }
  };

  frame = requestAnimationFrame(restore);
  return () => {
    cancelled = true;
    cancelAnimationFrame(frame);
  };
}

export function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const key = getScrollKey();
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    let cancelRestore = restoreScroll(key);

    let ticking = false;
    const requestSave = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        saveScroll(key);
      });
    };

    const saveBeforeInternalNavigation = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!anchor || anchor.target || event.defaultPrevented) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      saveScroll(key);
    };

    const saveOnVisibilityChange = () => {
      if (document.visibilityState === 'hidden') saveScroll(key);
    };
    const saveCurrentRoute = () => saveScroll(key);
    const restoreOnPageShow = () => {
      cancelRestore();
      cancelRestore = restoreScroll(key);
    };

    window.addEventListener('scroll', requestSave, { passive: true });
    window.addEventListener('beforeunload', saveCurrentRoute);
    window.addEventListener('pagehide', saveCurrentRoute);
    window.addEventListener('pageshow', restoreOnPageShow);
    document.addEventListener('visibilitychange', saveOnVisibilityChange);
    document.addEventListener('click', saveBeforeInternalNavigation, true);

    return () => {
      cancelRestore();
      saveScroll(key);
      window.history.scrollRestoration = previousRestoration;
      window.removeEventListener('scroll', requestSave);
      window.removeEventListener('beforeunload', saveCurrentRoute);
      window.removeEventListener('pagehide', saveCurrentRoute);
      window.removeEventListener('pageshow', restoreOnPageShow);
      document.removeEventListener('visibilitychange', saveOnVisibilityChange);
      document.removeEventListener('click', saveBeforeInternalNavigation, true);
    };
  }, [pathname]);

  return null;
}
