"use client";

import { useEffect, useRef, useState } from "react";
import PixelBlast, { type PixelBlastVariant } from "@/components/effects/PixelBlast";

type PixelBlastBackgroundProps = {
  /**
   * CSS custom property name to resolve the dither color from.
   * Defaults to the central --tb-pixelblast-color token.
   * Pass a module token (e.g. "--tb-blog") to sync the header with a module color.
   */
  colorVar?: string;
  variant?: PixelBlastVariant;
  className?: string;
  /** Optional overrides; otherwise read from design tokens. */
  pixelSize?: number;
  patternScale?: number;
  patternDensity?: number;
  edgeFade?: number;
  speed?: number;
  enableRipples?: boolean;
};

/** Read a CSS variable from :root / .dark and return a renderer-friendly color. */
function readCssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const probe = document.createElement("span");
  probe.style.color = `var(${name})`;
  probe.style.display = "none";
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved || fallback;
}

function readCssNumber(name: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

export default function PixelBlastBackground({
  colorVar = "--tb-pixelblast-color",
  variant = "square",
  className,
  pixelSize,
  patternScale,
  patternDensity,
  edgeFade,
  speed,
  enableRipples = true,
}: PixelBlastBackgroundProps) {
  const [mounted, setMounted] = useState(false);
  const [tokens, setTokens] = useState({
    color: "#3b46f6",
    pixelSize: 4,
    patternScale: 2,
    patternDensity: 1.1,
    edgeFade: 0.32,
    speed: 0.45,
    rippleSpeed: 0.4,
    rippleThickness: 0.12,
    rippleIntensity: 1.4,
    opacity: 0.55,
  });
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    const sync = () => {
      setTokens({
        color: readCssVar(colorVar, "#3b46f6"),
        pixelSize: pixelSize ?? readCssNumber("--tb-pixelblast-pixel-size", 4),
        patternScale: patternScale ?? readCssNumber("--tb-pixelblast-pattern-scale", 2),
        patternDensity: patternDensity ?? readCssNumber("--tb-pixelblast-pattern-density", 1.1),
        edgeFade: edgeFade ?? readCssNumber("--tb-pixelblast-edge-fade", 0.32),
        speed: speed ?? readCssNumber("--tb-pixelblast-speed", 0.45),
        rippleSpeed: readCssNumber("--tb-pixelblast-ripple-speed", 0.4),
        rippleThickness: readCssNumber("--tb-pixelblast-ripple-thickness", 0.12),
        rippleIntensity: readCssNumber("--tb-pixelblast-ripple-intensity", 1.4),
        opacity: readCssNumber("--tb-pixelblast-opacity", 0.55),
      });
    };
    setMounted(true);
    sync();

    // Re-resolve colors when the theme (dark class) toggles.
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    observerRef.current = observer;
    return () => observer.disconnect();
  }, [colorVar, pixelSize, patternScale, patternDensity, edgeFade, speed]);

  if (!mounted) return null;

  return (
    <div
      className={`pointer-events-none absolute inset-0 ${className ?? ""}`}
      style={{ opacity: tokens.opacity }}
      aria-hidden="true"
    >
      <PixelBlast
        variant={variant}
        color={tokens.color}
        pixelSize={tokens.pixelSize}
        patternScale={tokens.patternScale}
        patternDensity={tokens.patternDensity}
        edgeFade={tokens.edgeFade}
        speed={tokens.speed}
        enableRipples={enableRipples}
        rippleSpeed={tokens.rippleSpeed}
        rippleThickness={tokens.rippleThickness}
        rippleIntensityScale={tokens.rippleIntensity}
        transparent
        autoPauseOffscreen
      />
    </div>
  );
}
