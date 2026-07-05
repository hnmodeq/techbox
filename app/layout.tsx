import type { Metadata } from "next";
import "@fontsource/vazirmatn/index.css";
import "@/design/globals.css";
import { kalameh } from "@/lib/fonts";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

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
 <body className="font-sans antialiased text-foreground">
 <LayoutShell>{children}</LayoutShell>
  <Analytics />
  <SpeedInsights />
 </body>
 </html>
 );
}
