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
import Chatbot from "@/features/chat/components/Chatbot";
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
                <div className="relative z-10 flex min-h-screen w-full max-w-full">
                  <SidebarMain />
                  <main className="min-w-0 flex-1 flex flex-col overflow-x-hidden max-w-full">
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
