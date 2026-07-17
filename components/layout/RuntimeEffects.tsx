"use client";

import * as React from "react";

export function RuntimeEffects() {
  React.useEffect(() => {
    try {
      const root = document.documentElement;

      const main = localStorage.getItem("takbox-sidebar-desktop-open");
      const news = localStorage.getItem("techbox-news-sidebar-open");

      root.dataset.mainSidebarOpen = main === null ? "true" : String(main === "true");
      root.dataset.newsSidebarOpen = String(news === "true");

      // Remove booting classes after a frame — the SSR HTML already has them,
      // so transitions are disabled from the very first paint. Removing them
      // after hydration re-enables smooth transitions for subsequent
      // sidebar open/close toggles.
      requestAnimationFrame(() => {
        root.classList.remove("main-sidebar-booting", "news-sidebar-booting");
      });
    } catch {}
  }, []);

  React.useEffect(() => {
    try {
      if (!("serviceWorker" in navigator)) return;

      const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
      const isSecureProduction = window.location.protocol === "https:" && !isLocalhost;

      window.addEventListener("load", () => {
        if (isSecureProduction) {
          navigator.serviceWorker.register("/sw.js").catch(() => {});
          return;
        }

        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => registration.unregister());
        });
        if ("caches" in window) {
          caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
        }
      });
    } catch {}
  }, []);

  React.useEffect(() => {
    // Suppress AbortError from <video> elements during React unmount.
    // When a <video> with an active fetch is unmounted (e.g. closing a
    // modal, navigating between videos), the browser aborts the fetch
    // and throws an unhandled DOMException. This is expected behavior,
    // not a bug, so we prevent it from polluting the console.
    const onUnhandled = (e: PromiseRejectionEvent) => {
      if (e.reason instanceof DOMException && e.reason.name === 'AbortError') {
        e.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', onUnhandled);
    return () => window.removeEventListener('unhandledrejection', onUnhandled);
  }, []);

  return null;
}

export default RuntimeEffects;
