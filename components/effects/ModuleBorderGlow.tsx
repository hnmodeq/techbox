"use client";

import { useEffect, useState, type ReactNode } from "react";
import BorderGlow from "@/components/effects/BorderGlow";
import { getModuleGradient } from "@/lib/get-module-gradient";

type ModuleBorderGlowProps = {
  children: ReactNode;
  /** A module color class/token from config/module-colors.ts (e.g. moduleMeta[slug].color). */
  moduleColor: string;
  className?: string;
};

/** Resolve a CSS color expression (var/oklch/hex) to a concrete rgb() string. */
function resolveColor(expr: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const probe = document.createElement("span");
  probe.style.color = expr;
  probe.style.display = "none";
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved || fallback;
}

function resolveVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return raw || fallback;
}

function resolveNumber(name: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

/** "H S% L%" tokens are kept as-is for the box-shadow glow color. */
export default function ModuleBorderGlow({ children, moduleColor, className }: ModuleBorderGlowProps) {
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState<{
    colors: string[];
    glowColor: string;
    backgroundColor: string;
    borderRadius: number;
    glowRadius: number;
    glowIntensity: number;
    coneSpread: number;
    edgeSensitivity: number;
    fillOpacity: number;
  }>({
    colors: ["#c084fc", "#f472b6", "#38bdf8"],
    glowColor: "222 89% 62%",
    backgroundColor: "#0b152a",
    borderRadius: 24,
    glowRadius: 34,
    glowIntensity: 0.55,
    coneSpread: 25,
    edgeSensitivity: 32,
    fillOpacity: 0.45,
  });

  useEffect(() => {
    const sync = () => {
      // Module-synced 3-color mesh: resolve the module token to concrete rgb so masks/gradients render.
      const [c1, c2, c3] = getModuleGradient(moduleColor);
      const colors = [resolveColor(c1, "#c084fc"), resolveColor(c2, "#f472b6"), resolveColor(c3, "#38bdf8")];
      setConfig({
        colors,
        glowColor: resolveVar("--tb-borderglow-glow-hsl", "222 89% 62%"),
        backgroundColor: resolveColor(resolveVar("--tb-borderglow-bg", "var(--tb-card)"), "#0b152a"),
        borderRadius: parseFloat(resolveVar("--tb-borderglow-radius", "24")) || 24,
        glowRadius: parseFloat(resolveVar("--tb-borderglow-glow-radius", "34")) || 34,
        glowIntensity: resolveNumber("--tb-borderglow-glow-intensity", 0.55),
        coneSpread: resolveNumber("--tb-borderglow-cone-spread", 25),
        edgeSensitivity: resolveNumber("--tb-borderglow-edge-sensitivity", 32),
        fillOpacity: resolveNumber("--tb-borderglow-fill-opacity", 0.45),
      });
    };
    setMounted(true);
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [moduleColor]);

  if (!mounted) {
    // SSR / first paint: render content in a neutral token-styled shell to avoid layout shift.
    return (
      <div
        className={className}
        style={{
          borderRadius: "var(--tb-borderglow-radius, 24px)",
          border: "1px solid var(--tb-borderglow-border, var(--tb-border))",
          background: "var(--tb-borderglow-bg, var(--tb-card))",
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <BorderGlow
      className={className}
      colors={config.colors}
      glowColor={config.glowColor}
      backgroundColor={config.backgroundColor}
      borderRadius={config.borderRadius}
      glowRadius={config.glowRadius}
      glowIntensity={config.glowIntensity}
      coneSpread={config.coneSpread}
      edgeSensitivity={config.edgeSensitivity}
      fillOpacity={config.fillOpacity}
    >
      {children}
    </BorderGlow>
  );
}
