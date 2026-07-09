import localFont from "next/font/local";

// Kalameh is the primary Persian font. We intentionally do NOT preload every
// weight: with 9 weights, preloading would issue 9 blocking requests on first
// paint. Instead we rely on `display: "swap"` (no invisible text) and let the
// browser fetch only the weights actually used in rendered text.
export const kalameh = localFont({
  src: [
    { path: "../public/fonts/KalamehWebFaNum-Thin.woff2", weight: "100", style: "normal" },
    { path: "../public/fonts/KalamehWebFaNum-ExtraLight.woff2", weight: "200", style: "normal" },
    { path: "../public/fonts/KalamehWebFaNum-Light.woff2", weight: "300", style: "normal" },
    { path: "../public/fonts/KalamehWebFaNum-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/KalamehWebFaNum-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/KalamehWebFaNum-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/KalamehWebFaNum-Bold.woff2", weight: "700", style: "normal" },
    { path: "../public/fonts/KalamehWebFaNum-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "../public/fonts/KalamehWebFaNum-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-kalameh",
  display: "swap",
  fallback: ["Vazirmatn", "system-ui", "Tahoma", "sans-serif"],
  adjustFontFallback: false,
  preload: false,
});
