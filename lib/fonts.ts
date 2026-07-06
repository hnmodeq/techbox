import localFont from "next/font/local";

// Full Kalameh font family with all 9 weights for perfect typography
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
  adjustFontFallback: true,
  preload: true,
});
