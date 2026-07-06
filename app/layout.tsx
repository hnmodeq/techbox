import type { Metadata } from "next";
import "@fontsource/vazirmatn/index.css";
import "@/design/globals.css";
import { kalameh } from "@/lib/fonts";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ScrollRestoration } from "@/components/ScrollRestoration";

// Critical inline styles (inlined for performance)
const criticalStyles = `
:root { --font-kalameh: var(--font-kalameh); }
html, body { font-family: var(--font-kalameh), system-ui, sans-serif; direction: rtl; }
h1, .hero-title { font-size: var(--hero-font-size); font-weight: 800; }
button, .btn { font-family: inherit; transition: all 0.2s ease; }
`;

// Inline script to prevent dark mode flash (FOUC)
const themeScript = `
(function() {
  try {
    const THEME_KEY = 'takbox-theme';
    const saved = localStorage.getItem(THEME_KEY);
    let theme = 'light';
    if (saved === 'dark' || saved === 'light') {
      theme = saved;
    } else {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
`;

export const metadata: Metadata = {
  title: "رسانه تکنولوژی تکباکس",
  description: "پاتوق بچه‌های فناوری اطلاعات",
  manifest: "/manifest.json",
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={kalameh.variable}
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: criticalStyles }} />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased text-foreground">
        <ScrollRestoration />
        <LayoutShell>{children}</LayoutShell>
        <Analytics />
        <SpeedInsights />
        <script src="/register-sw.js" defer />
      </body>
    </html>
  );
}
