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
import { getHomeData } from "@/lib/home-server";
import { getModuleConfig, type SiteLayoutConfig } from "@/lib/module-config";
import type { HomeData } from "@/features/home/lib/home-data";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { RuntimeEffects } from "@/components/layout/RuntimeEffects";
import { ModuleColorApplier } from "@/components/layout/ModuleColorApplier";

// Critical inline styles (inlined for performance)
const criticalStyles = `
html, body { font-family: var(--font-kalameh), Vazirmatn, system-ui, Tahoma, sans-serif; direction: rtl; font-synthesis-weight: none; font-synthesis-style: none; }
h1, .hero-title { font-size: var(--hero-font-size); font-weight: 800; }
button, .btn { font-family: inherit; transition: all 0.2s ease; }
`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: defaultSeo.title,
    template: "%s",
  },
  description: defaultSeo.description,
  manifest: "/manifest.json",
  alternates: { canonical: siteUrl() },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "TechBox",
    title: defaultSeo.title,
    description: defaultSeo.description,
    url: siteUrl(),
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "TechBox" }],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultSeo.title,
    description: defaultSeo.description,
    images: ["/logo.png"],
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
      getHomeData(),
      getModuleConfig(),
    ]);
  } catch {
    homeData = undefined;
    moduleConfig = undefined;
  }
  return (
    <html
      lang="fa"
      dir="rtl"
      data-main-sidebar-open="true"
      className={cn(kalameh.variable, kalameh.className, "font-sans", "main-sidebar-booting", "news-sidebar-booting")}
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: criticalStyles }} />
      </head>
      <body className="font-sans antialiased text-foreground">
        <RuntimeEffects />
        <ModuleColorApplier />
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
