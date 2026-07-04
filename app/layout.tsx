import type { Metadata } from "next";
import "@fontsource/vazirmatn/index.css";
import "@/design/foundation/globals.css";
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
 <head>
 <script
 dangerouslySetInnerHTML={{
 __html: `(function(){try{var t=localStorage.getItem("tb_theme")||"dark";if(t==="dark")document.documentElement.classList.add("dark");else document.documentElement.classList.remove("dark");}catch(e){}})()`,
 }}
 />
 </head>
 <body className="font-sans antialiased text-foreground">
 <LayoutShell>{children}</LayoutShell>
  <Analytics />
  <SpeedInsights />
 </body>
 </html>
 );
}
