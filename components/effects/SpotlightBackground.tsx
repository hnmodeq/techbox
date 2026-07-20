"use client";

import { useEffect } from "react";

/**
 * SpotlightBackground — full-page mouse-tracking radial gradient effect.
 * Attaches to the document so the spotlight covers the entire viewport
 * regardless of scroll position.
 */
export function SpotlightBackground() {
  useEffect(() => {
    const el = document.createElement("div");
    el.id = "spotlight-bg";
    el.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      transition: background 0.1s ease;
      background: radial-gradient(600px circle at 50% 50%, rgba(99,102,241,0.06), transparent 70%);
    `;
    document.body.appendChild(el);

    const onMove = (e: MouseEvent) => {
      el.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(99,102,241,0.07), transparent 70%)`;
    };

    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      el.remove();
    };
  }, []);

  return null;
}
