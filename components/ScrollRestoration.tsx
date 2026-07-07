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
  if (saved === null) return;

  const scrollY = Number.parseInt(saved, 10);
  if (!Number.isFinite(scrollY)) return;

  // Run more than once because app-router pages can finish layout/streaming
  // after the first frame. This keeps Back/Forward feeling native.
  const restore = () => window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' });
  requestAnimationFrame(restore);
  window.setTimeout(restore, 50);
  window.setTimeout(restore, 150);
  window.setTimeout(restore, 300);
}

export function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const key = getScrollKey();
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    restoreScroll(key);

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

    window.addEventListener('scroll', requestSave, { passive: true });
    window.addEventListener('beforeunload', saveCurrentRoute);
    window.addEventListener('pagehide', saveCurrentRoute);
    document.addEventListener('visibilitychange', saveOnVisibilityChange);
    document.addEventListener('click', saveBeforeInternalNavigation, true);

    return () => {
      saveScroll(key);
      window.history.scrollRestoration = previousRestoration;
      window.removeEventListener('scroll', requestSave);
      window.removeEventListener('beforeunload', saveCurrentRoute);
      window.removeEventListener('pagehide', saveCurrentRoute);
      document.removeEventListener('visibilitychange', saveOnVisibilityChange);
      document.removeEventListener('click', saveBeforeInternalNavigation, true);
    };
  }, [pathname]);

  return null;
}
