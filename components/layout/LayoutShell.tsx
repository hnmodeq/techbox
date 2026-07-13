"use client"

import * as React from "react"
import dynamic from "next/dynamic"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TechboxAppSidebar } from "./techbox-app-sidebar"
import { TechboxNewsSidebar } from "./techbox-news-sidebar"
import { SiteHeader } from "./site-header"
import FooterSection from "@/components/layout/Footer"
import { CartProvider } from "@/providers/cart.provider"
import { StatsProvider } from "@/providers/stats.provider"
import { ThemeProvider } from "@/providers/theme.provider"
import { AuthProvider } from "@/providers/auth.provider"
import { HomeDataProvider, type HomeData } from "@/features/home/lib/home-data"
import { useHomeModule, useHomeTicker } from "@/features/home/lib/home-data"
import NewsTicker from "@/features/news/components/NewsTicker"

// Lightweight placeholder that mirrors the chat launcher
const ChatLauncherFallback = () => (
  <button
    type="button"
    aria-hidden
    tabIndex={-1}
    className="fixed bottom-5 left-5 rounded-full bg-card border border-border px-4 py-2.5 text-foreground shadow-md flex items-center gap-2 text-xs sm:text-sm"
  >
    <span>چت تکباکس</span>
  </button>
)

const Chatbot = dynamic(() => import("@/features/chat/components/Chatbot"), {
  ssr: false,
  loading: () => <ChatLauncherFallback />,
})

import { AuthModal } from "@/features/auth/components/auth-modal"

const READ_NEWS_STORAGE_KEY = "techbox-read-news-slugs"

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
  const [readNewsSlugs, setReadNewsSlugs] = React.useState<string[]>([])

  const { items: dbNews } = useHomeModule("news")
  const { items: tickerItems } = useHomeTicker()
  const newsSlugs = React.useMemo(() => dbNews.map((item) => item.slug).filter(Boolean), [dbNews])
  const hasUnreadNews = newsSlugs.some((slug) => !readNewsSlugs.includes(slug))

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(READ_NEWS_STORAGE_KEY)
      if (stored) setReadNewsSlugs(JSON.parse(stored))
    } catch {}
  }, [])

  React.useEffect(() => {
    try {
      document.documentElement.dataset.newsSidebarOpen = String(newsOpen)
      localStorage.setItem("techbox-news-sidebar-open", String(newsOpen))
    } catch {}
  }, [newsOpen])

  React.useEffect(() => {
    if (!newsOpen || newsSlugs.length === 0) return
    setReadNewsSlugs((current) => {
      const merged = Array.from(new Set([...current, ...newsSlugs])).slice(-200)
      try {
        localStorage.setItem(READ_NEWS_STORAGE_KEY, JSON.stringify(merged))
      } catch {}
      return merged
    })
  }, [newsOpen, newsSlugs])

  return (
    <div className="[--header-height:calc(var(--spacing)*14)]">
      <SidebarProvider className="min-h-svh w-full flex-col" defaultOpen={true}>
        <SiteHeader
          hasUnreadNews={hasUnreadNews}
          newsOpen={newsOpen}
          onToggleNews={() => setNewsOpen((open) => !open)}
        />
        <div className="flex min-h-[calc(100svh-var(--header-height))] w-full overflow-x-hidden" dir="rtl">
          <TechboxAppSidebar />
          <SidebarInset className="min-w-0 overflow-visible [container-type:inline-size]">
            {tickerItems.length > 0 && (
              <div className="border-b bg-background/95">
                <NewsTicker items={tickerItems} className="py-0" />
              </div>
            )}
            <main id="main-content" className="flex min-h-[calc(100svh-var(--header-height))] flex-col">
              <div className="w-full max-w-full flex-1">{children}</div>
              <FooterSection />
            </main>
          </SidebarInset>
          <SidebarProvider
            open={newsOpen}
            onOpenChange={setNewsOpen}
            className="contents"
            style={{ display: "contents", "--sidebar-width": "20rem" } as React.CSSProperties}
          >
            <TechboxNewsSidebar />
          </SidebarProvider>
        </div>
      </SidebarProvider>
    </div>
  )
}
