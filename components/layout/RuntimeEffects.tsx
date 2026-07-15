"use client";

import * as React from "react";

export function RuntimeEffects() {
  React.useEffect(() => {
    try {
      const root = document.documentElement;
      root.classList.add("main-sidebar-booting", "news-sidebar-booting");

      const main = localStorage.getItem("takbox-sidebar-desktop-open");
      const news = localStorage.getItem("techbox-news-sidebar-open");

      root.dataset.mainSidebarOpen = main === null ? "true" : String(main === "true");
      root.dataset.newsSidebarOpen = String(news === "true");
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

  return null;
}

export default RuntimeEffects;
