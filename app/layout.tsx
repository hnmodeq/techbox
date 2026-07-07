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
html, body { font-family: var(--font-kalameh), Vazirmatn, system-ui, Tahoma, sans-serif; direction: rtl; font-synthesis-weight: none; font-synthesis-style: none; }
h1, .hero-title { font-size: var(--hero-font-size); font-weight: 800; }
button, .btn { font-family: inherit; transition: all 0.2s ease; }
`;

const sidebarStateScript = `
(function() {
  try {
    var root = document.documentElement;
    root.classList.add('main-sidebar-booting', 'news-sidebar-booting');

    var main = localStorage.getItem('takbox-sidebar-desktop-open');
    var news = localStorage.getItem('techbox-news-sidebar-open');

    root.dataset.mainSidebarOpen = main === null ? 'true' : String(main === 'true');
    root.dataset.newsSidebarOpen = String(news === 'true');
  } catch (e) {}
})();
`;

const localServiceWorkerCleanupScript = `
(function() {
  try {
    var isLocalhost = ['localhost', '127.0.0.1', '::1'].indexOf(window.location.hostname) !== -1;
    if (!isLocalhost || !('serviceWorker' in navigator)) return;
    window.addEventListener('load', function() {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        registrations.forEach(function(registration) { registration.unregister(); });
      });
      if ('caches' in window) {
        caches.keys().then(function(keys) { keys.forEach(function(key) { caches.delete(key); }); });
      }
    });
  } catch (e) {}
})();
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
      className={`${kalameh.variable} ${kalameh.className}`}
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: criticalStyles }} />
        <script dangerouslySetInnerHTML={{ __html: sidebarStateScript }} />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased text-foreground">
        <ScrollRestoration />
        <LayoutShell>{children}</LayoutShell>
        <Analytics />
        <SpeedInsights />
        {process.env.NODE_ENV === "production" ? (
          <script src="/register-sw.js?v=3" defer />
        ) : (
          <script dangerouslySetInnerHTML={{ __html: localServiceWorkerCleanupScript }} />
        )}
      </body>
    </html>
  );
}
