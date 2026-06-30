"use client";

import { useEffect, useRef, useState } from "react";
import Aurora from "@/components/effects/Aurora";
import { cn } from "@/lib/utils";

/**
 * ──────────────────────────────────────────────────────────────────────────
 *  HERO / PAGE BACKGROUND — single swappable effect for the whole site.
 *  (This is the "bg-hero" the design owns: change the effect HERE once and it
 *   updates the homepage hero AND every page header at the same time.)
 *
 *  To swap the effect later: replace the <Aurora /> render below with another
 *  effect component. Keep the same props (colorVar / variant / className) so
 *  every call site (HeroSection, PageHeader) keeps working with no changes.
 * ──────────────────────────────────────────────────────────────────────────
 */

type HeroBackgroundProps = {
  /**
   * CSS custom property to tint the effect with (e.g. "--tb-blog", "--tb-admin").
   * When provided, the resolved color becomes the dominant aurora stop so the
   * background syncs with that module/page color. Omit for the neutral brand hero.
   */
  colorVar?: string;
  /** Kept for API-compatibility with the previous PixelBlast wrapper; unused by Aurora. */
  variant?: string;
  className?: string;
};

/** Resolve a CSS color expression (var/oklch/hex) to a concrete #hex string. */
function resolveColor(expr: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const probe = document.createElement("span");
  probe.style.color = expr;
  probe.style.display = "none";
  document.body.appendChild(probe);
  const rgb = getComputedStyle(probe).color;
  probe.remove();
  const m = rgb.match(/\d+(\.\d+)?/g);
  if (!m || m.length < 3) return fallback;
  const [r, g, b] = m.slice(0, 3).map((n) => Math.round(parseFloat(n)));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function readVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return raw || fallback;
}

function readNumber(name: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const n = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name).trim());
  return Number.isFinite(n) ? n : fallback;
}

export default function HeroBackground({ colorVar, className }: HeroBackgroundProps) {
  const [mounted, setMounted] = useState(false);
  const [cfg, setCfg] = useState({
    colorStops: ["#1d2a8a", "#3b46f6", "#1d2a8a"],
    amplitude: 1,
    blend: 0.5,
    speed: 1,
    opacity: 0.6,
  });
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    const sync = () => {
      const c1 = resolveColor(readVar("--tb-aurora-color-1", "#1d2a8a"), "#1d2a8a");
      const c2 = resolveColor(readVar("--tb-aurora-color-2", "#3b46f6"), "#3b46f6");
      const c3 = resolveColor(readVar("--tb-aurora-color-3", "#1d2a8a"), "#1d2a8a");
      // When a module/page color var is provided, let it dominate the middle stop.
      const accent = colorVar ? resolveColor(`var(${colorVar})`, c2) : c2;
      setCfg({
        colorStops: colorVar ? [c1, accent, c3] : [c1, c2, c3],
        amplitude: readNumber("--tb-aurora-amplitude", 1),
        blend: readNumber("--tb-aurora-blend", 0.5),
        speed: readNumber("--tb-aurora-speed", 1),
        opacity: readNumber("--tb-aurora-opacity", 0.6),
      });
    };
    setMounted(true);
    sync();
    // Re-resolve when the theme (dark class) toggles.
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    observerRef.current = observer;
    return () => observer.disconnect();
  }, [colorVar]);

  if (!mounted) return null;

  return (
    <div
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{ opacity: cfg.opacity }}
      aria-hidden="true"
    >
      <Aurora
        colorStops={cfg.colorStops}
        amplitude={cfg.amplitude}
        blend={cfg.blend}
        speed={cfg.speed}
      />
    </div>
  );
}
