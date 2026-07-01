import type { Metadata } from "next";
import "@/design/foundation/globals.css";
import { kalameh } from "@/lib/fonts";
import { LayoutShell } from "@/components/layout/LayoutShell";

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
 </body>
 </html>
 );
}
