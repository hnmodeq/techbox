import type { Metadata } from "next";
import "@fontsource/vazirmatn/index.css";
import "@/design/globals.css";
import { kalameh } from "@/lib/fonts";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ScrollRestoration } from "@/components/ScrollRestoration";

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
    // Also set color-scheme early
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
`;

export const metadata: Metadata = {
  title: "رسانه تکنولوژی تکباکس",
  description: "پاتوق بچه‌های فناوری اطلاعات",
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
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased text-foreground">
        <ScrollRestoration />
        <LayoutShell>{children}</LayoutShell>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
