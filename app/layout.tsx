import type { Metadata } from "next";
import "@fontsource/vazirmatn/300.css";
import "@fontsource/vazirmatn/400.css";
import "@fontsource/vazirmatn/500.css";
import "@fontsource/vazirmatn/600.css";
import "@fontsource/vazirmatn/700.css";
import "@/design/globals.css";
import { kalameh } from "@/lib/fonts";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ScrollRestoration } from "@/components/ScrollRestoration";
import { defaultSeo, siteUrl } from "@/lib/seo";
import { getLayoutHomeData } from "@/lib/home-server";
import { getModuleConfig, type SiteLayoutConfig } from "@/lib/module-config";
import { COLORABLE_MODULE_SLUGS, resolveModuleColor } from "@/config/module-colors";
import { autoPublishScheduled } from "@/lib/auto-publish";
import type { HomeData } from "@/features/home/lib/home-data";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { RuntimeEffects } from "@/components/layout/RuntimeEffects";
import { WebSiteJsonLd, OrganizationJsonLd } from "@/components/seo/SiteJsonLd";

// Critical inline styles (inlined for performance)
const criticalStyles = `
html, body { font-family: var(--font-kalameh), Vazirmatn, system-ui, Tahoma, sans-serif; direction: rtl; font-synthesis-weight: none; font-synthesis-style: none; }
h1, .hero-title { font-size: var(--hero-font-size); font-weight: 800; }
button, .btn { font-family: inherit; transition: all 0.2s ease; }
`;

type ModuleColorStyle = React.CSSProperties & Record<`--${string}`, string>;

/**
 * Paint module colours in the server HTML, before any client component
 * hydrates. The database remains the source of truth; this simply makes the
 * already-fetched config available to CSS at first paint rather than waiting
 * for ModuleColorApplier's client effect.
 */
function moduleColorStyle(config: SiteLayoutConfig | undefined): ModuleColorStyle | undefined {
  if (!config || config.moduleColorsEnabled === false) return undefined;

  const style: ModuleColorStyle = {};
  for (const slug of COLORABLE_MODULE_SLUGS) {
    style[`--module-${slug}-color`] = resolveModuleColor(slug, config.moduleColors[slug]);
  }
  return style;
}

// Localhost service-worker safety net.
//
// The app itself only registers /sw.js on secure production origins, so a
// worker should never exist on localhost. But a worker installed by an
// earlier build (or by visiting the deployed site on the same browser
// profile) outlives the code that registered it and keeps serving cached
// HTML/RSC. This runs before hydration so a controlling worker cannot
// prevent its own removal by looping the page before React mounts.
//
// This is a self-deleting escape hatch, not load-bearing behaviour.
const localServiceWorkerCleanup = `
(() => {
  try {
    const local = ["localhost", "127.0.0.1", "::1"].includes(location.hostname);
    if (!local || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => registrations.forEach((registration) => registration.unregister()))
      .catch(() => {});
    if ("caches" in window) {
      caches.keys().then((keys) => keys.forEach((key) => caches.delete(key))).catch(() => {});
    }
  } catch (_) {}
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: defaultSeo.title,
    template: "%s",
  },
  description: defaultSeo.description,
  manifest: "/manifest.json",
  alternates: {
    canonical: siteUrl(),
    types: {
      "application/rss+xml": [{ url: `${siteUrl()}/feed.xml`, title: "تکباکس RSS Feed" }],
    },
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "TechBox",
    title: defaultSeo.title,
    description: defaultSeo.description,
    url: siteUrl(),
    images: [{ url: `/api/og?title=${encodeURIComponent(defaultSeo.title)}`, width: 1200, height: 630, alt: "TechBox" }],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultSeo.title,
    description: defaultSeo.description,
    images: [`/api/og?title=${encodeURIComponent(defaultSeo.title)}`],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "تکباکس",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let homeData: HomeData | undefined;
  let moduleConfig: SiteLayoutConfig | undefined;
  try {
    [homeData, moduleConfig] = await Promise.all([
      getLayoutHomeData(),
      getModuleConfig(),
    ]);
  } catch {
    homeData = undefined;
    moduleConfig = undefined;
  }

  // Fire-and-forget: auto-publish any overdue scheduled posts (60s cooldown built in)
  autoPublishScheduled().catch(() => {});
  const colorsEnabled = moduleConfig?.moduleColorsEnabled !== false;

  return (
    <html
      lang="fa"
      dir="rtl"
      data-main-sidebar-open="true"
      data-module-colors={colorsEnabled ? "enabled" : "disabled"}
      style={moduleColorStyle(moduleConfig)}
      className={cn(kalameh.variable, kalameh.className, "font-sans", "main-sidebar-booting", "news-sidebar-booting")}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: localServiceWorkerCleanup }} />
        <style dangerouslySetInnerHTML={{ __html: criticalStyles }} suppressHydrationWarning />
        <WebSiteJsonLd />
        <OrganizationJsonLd />
      </head>
      <body className="font-sans antialiased text-foreground">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-[9999] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:text-sm focus:font-medium">
          رد شدن به محتوای اصلی
        </a>
        <RuntimeEffects />
        <TooltipProvider>
          <ScrollRestoration />
          <LayoutShell homeData={homeData} serverModuleConfig={moduleConfig}>{children}</LayoutShell>
          <Analytics />
          <SpeedInsights />
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
