"use client";

import * as React from "react";
import SidebarMain from "@/components/layout/Sidebar";
import NewsSidebar from "@/features/home/components/NewsSidebar";
import FooterSection from "@/components/layout/Footer";
import { CartProvider } from "@/providers/cart.provider";
import { StatsProvider } from "@/providers/stats.provider";
import { ThemeProvider } from "@/providers/theme.provider";
import { AuthProvider } from "@/providers/auth.provider";
import { HomeDataProvider, type HomeData } from "@/features/home/lib/home-data";
import dynamic from "next/dynamic";

// Lightweight placeholder that mirrors the chat launcher so the "پشتیبانی"
// button stays visible instantly while the heavier Chatbot chunk loads.
const ChatLauncherFallback = () => (
  <button
    type="button"
    aria-hidden
    tabIndex={-1}
    className="fixed bottom-5 left-5 rounded-full bg-[var(--card-background)] border-[length:var(--border-size)] border-[var(--border-color)] px-4.5 py-2.5 text-[var(--primary-text)] shadow-[var(--shadow-size)] flex items-center gap-2 font-normal text-xs sm:text-sm"
  >
    <span>پشتیبانی</span>
  </button>
);

const Chatbot = dynamic(() => import("@/features/chat/components/Chatbot"), {
  ssr: false,
  loading: () => <ChatLauncherFallback />,
});
import { AuthModal } from "@/features/auth/components/auth-modal";

export function LayoutShell({
  children,
  homeData,
}: {
  children: React.ReactNode;
  homeData?: HomeData;
}) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <StatsProvider>
            <HomeDataProvider initialData={homeData}>
              <div className="relative min-h-screen text-foreground overflow-x-hidden w-full max-w-full">
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:absolute focus:z-[999] focus:p-4 focus:bg-[var(--home)] focus:text-white focus:rounded-b-lg focus:left-4"
                >
                  پرش به محتوای اصلی
                </a>
                <div className="relative z-10 flex min-h-screen w-full max-w-full">
                  <SidebarMain />
                  <main id="main-content" className="min-w-0 flex-1 flex flex-col overflow-x-hidden max-w-full">
                    <div className="flex-1 w-full">{children}</div>
                    <FooterSection />
                  </main>
                  <NewsSidebar />
                </div>
                <Chatbot />
                <AuthModal />
              </div>
            </HomeDataProvider>
          </StatsProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
