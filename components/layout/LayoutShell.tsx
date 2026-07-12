"use client"

import * as React from "react"
import dynamic from "next/dynamic"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TechboxAppSidebar } from "./techbox-app-sidebar"
import { TechboxNewsSidebar } from "./techbox-news-sidebar"
import { SiteHeader } from "./site-header"
import { LiveNewsButton } from "./live-news-button"
import FooterSection from "@/components/layout/Footer"
import { CartProvider } from "@/providers/cart.provider"
import { StatsProvider } from "@/providers/stats.provider"
import { ThemeProvider } from "@/providers/theme.provider"
import { AuthProvider } from "@/providers/auth.provider"
import { HomeDataProvider, type HomeData } from "@/features/home/lib/home-data"
import { useHomeModule } from "@/features/home/lib/home-data"

// Lightweight placeholder that mirrors the chat launcher
const ChatLauncherFallback = () => (
  <button
    type="button"
    aria-hidden
    tabIndex={-1}
    className="fixed bottom-5 left-5 rounded-full bg-card border border-border px-4 py-2.5 text-foreground shadow-md flex items-center gap-2 text-xs sm:text-sm"
  >
    <span>پشتیبانی</span>
  </button>
)

const Chatbot = dynamic(() => import("@/features/chat/components/Chatbot"), {
  ssr: false,
  loading: () => <ChatLauncherFallback />,
})

import { AuthModal } from "@/features/auth/components/auth-modal"

type LayoutShellProps = {
  children: React.ReactNode
  homeData?: HomeData
}

export function LayoutShell({ children, homeData }: LayoutShellProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <StatsProvider>
            <HomeDataProvider initialData={homeData}>
              <LayoutInner>{children}</LayoutInner>
              <Chatbot />
              <AuthModal />
            </HomeDataProvider>
          </StatsProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

function LayoutInner({ children }: { children: React.ReactNode }) {
  const [newsOpen, setNewsOpen] = React.useState(false)

  const { items: dbNews } = useHomeModule("news")
  const hasUnreadNews = dbNews.length > 0

  return (
    <div className="[--header-height:calc(var(--spacing)*14)]">
      <SidebarProvider className="flex flex-col" defaultOpen={true}>
        <SiteHeader hasUnreadNews={hasUnreadNews} />
        <div className="flex flex-1">
          <TechboxNewsSidebar open={newsOpen} onClose={() => setNewsOpen(false)} />
          <TechboxAppSidebar />
          <SidebarInset>
            <main id="main-content" className="flex flex-col min-h-screen">
              <div className="flex-1 w-full">{children}</div>
              <FooterSection />
            </main>
          </SidebarInset>
        </div>
        <LiveNewsButton onClick={() => setNewsOpen(true)} hasUnread={hasUnreadNews} />
      </SidebarProvider>
    </div>
  )
}
