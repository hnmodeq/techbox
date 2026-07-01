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

/** Convert an "rgb(r, g, b)" string to an "H S% L%" string for the glow box-shadow. */
function rgbToHsl(rgb: string): string {
 const m = rgb.match(/\d+(\.\d+)?/g);
 if (!m || m.length < 3) return "222 89% 62%";
 const [r, g, b] = m.slice(0, 3).map((n) => parseFloat(n) / 255);
 const max = Math.max(r, g, b);
 const min = Math.min(r, g, b);
 const l = (max + min) / 2;
 let h = 0;
 let s = 0;
 if (max !== min) {
 const d = max - min;
 s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
 if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
 else if (max === g) h = (b - r) / d + 2;
 else h = (r - g) / d + 4;
 h /= 6;
 }
 return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

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
 // Glow color is the module color itself (converted to HSL) — no effect-specific color var.
 const moduleRgb = resolveColor(getModuleGradient(moduleColor)[0], "rgb(96,165,250)");
 const radiusPx = parseFloat(resolveVar("--tb-radius-lg", "14")) || 14;
 setConfig({
 colors,
 glowColor: rgbToHsl(moduleRgb),
 backgroundColor: resolveColor("var(--tb-bg-secondary)", "#0b152a"),
 borderRadius: radiusPx,
 // shader-shape tunables (not colors/borders/shadows) — kept as constants
 glowRadius: 34,
 glowIntensity: 0.55,
 coneSpread: 14,
 edgeSensitivity: 32,
 fillOpacity: 0.45,
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
 borderRadius: "var(--tb-radius-lg)",
 border: "var(--tb-border-sm) solid var(--tb-border)",
 background: "var(--tb-bg-secondary)",
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
