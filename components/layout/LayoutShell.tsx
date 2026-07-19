"use client"

import * as React from "react"
import dynamic from "next/dynamic"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TechboxAppSidebar } from "./techbox-app-sidebar"
import { TechboxNewsSidebar } from "./techbox-news-sidebar"
import { SiteHeader } from "./site-header"
import FooterSection from "@/components/layout/Footer"
import { ConsultationProvider } from "@/providers/consultation.provider"
import { StatsProvider } from "@/providers/stats.provider"
import { ThemeProvider } from "@/providers/theme.provider"
import { AuthProvider, useAuth } from "@/providers/auth.provider"
import { HomeDataProvider, type HomeData } from "@/features/home/lib/home-data"
import { ModuleConfigProvider } from "@/providers/module-config.provider"
import { TimelineLikesProvider } from "@/providers/timeline-likes.provider"
import { useHomeModule, useHomeTicker } from "@/features/home/lib/home-data"
import NewsTicker from "@/features/news/components/NewsTicker"
import type { SiteLayoutConfig } from "@/lib/module-config"

// Lightweight placeholder that mirrors the chat launcher (icon-only, no text)
const ChatLauncherFallback = () => (
  <button
    type="button"
    aria-hidden
    tabIndex={-1}
    className="fixed bottom-5 left-5 rounded-full bg-primary text-primary-foreground border border-border size-12 shadow-md flex items-center justify-center"
  >
    <span className="size-5 rounded-full bg-primary-foreground/40" />
  </button>
)

const Chatbot = dynamic(() => import("@/features/chat/components/Chatbot"), {
  ssr: false,
  loading: () => <ChatLauncherFallback />,
})

import { AuthModal } from "@/features/auth/components/auth-modal"
import { HelpModals } from "@/components/layout/help-modals"

type LayoutShellProps = {
  children: React.ReactNode
  homeData?: HomeData
  serverModuleConfig?: SiteLayoutConfig
}

export function LayoutShell({ children, homeData, serverModuleConfig }: LayoutShellProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ConsultationProvider>
          <StatsProvider>
            <HomeDataProvider initialData={homeData}>
              <ModuleConfigProvider serverConfig={serverModuleConfig}>
                <TimelineLikesProvider>
                  <LayoutInner>{children}</LayoutInner>
                </TimelineLikesProvider>
              </ModuleConfigProvider>
              <Chatbot />
              <AuthModal />
              <HelpModals />
            </HomeDataProvider>
          </StatsProvider>
        </ConsultationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id ?? ""
  const [newsOpen, setNewsOpen] = React.useState(false)
  const [unreadNewsSlugs, setUnreadNewsSlugs] = React.useState<string[]>([])
  const [openedUnreadNewsSlugs, setOpenedUnreadNewsSlugs] = React.useState<string[]>([])

  const { items: dbNews } = useHomeModule("news")
  const { items: tickerItems } = useHomeTicker()
  const newsSlugsKey = dbNews.map((item) => item.slug).filter(Boolean).join(",")
  const hasUnreadNews = unreadNewsSlugs.length > 0

  React.useEffect(() => {
    try {
      document.documentElement.dataset.newsSidebarOpen = String(newsOpen)
      localStorage.setItem("techbox-news-sidebar-open", String(newsOpen))
    } catch {}
  }, [newsOpen])

  React.useEffect(() => {
    let cancelled = false

    if (!userId || !newsSlugsKey) {
      setUnreadNewsSlugs((current) => (current.length ? [] : current))
      return
    }

    fetch(`/api/news/read-state?slugs=${encodeURIComponent(newsSlugsKey)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) {
          const next = Array.isArray(data?.unreadSlugs) ? data.unreadSlugs : []
          setUnreadNewsSlugs((current) => (current.join(",") === next.join(",") ? current : next))
        }
      })
      .catch(() => {
        if (!cancelled) setUnreadNewsSlugs((current) => (current.length ? [] : current))
      })

    return () => {
      cancelled = true
    }
  }, [userId, newsSlugsKey])

  React.useEffect(() => {
    if (!newsOpen || !userId || !newsSlugsKey || unreadNewsSlugs.length === 0) return

    const slugs = newsSlugsKey.split(",").filter(Boolean)
    const unreadAtOpen = slugs.filter((slug) => unreadNewsSlugs.includes(slug))
    setOpenedUnreadNewsSlugs(unreadAtOpen)
    setUnreadNewsSlugs([])

    fetch("/api/news/read-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs }),
    }).catch(() => {})
  }, [newsOpen, userId, newsSlugsKey, unreadNewsSlugs])

  React.useEffect(() => {
    if (!newsOpen) setOpenedUnreadNewsSlugs([])
  }, [newsOpen])

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
          <SidebarInset className="min-w-0 overflow-visible [container-type:inline-size] relative">
            {tickerItems.length > 0 && (
              <div className="border-b bg-background/95">
                <NewsTicker items={tickerItems} className="py-0" />
              </div>
            )}
            <main id="main-content" className="flex min-h-[calc(100svh-var(--header-height))] flex-col">
              <div className="w-full max-w-full flex-1">{children}</div>
              <FooterSection />
            </main>
            {/* News sidebar overlays on top, doesn't push content */}
            {newsOpen && (
            <SidebarProvider
              open={newsOpen}
              onOpenChange={setNewsOpen}
              className="absolute inset-y-0 end-0 z-40"
              style={{ "--sidebar-width": "20rem" } as React.CSSProperties}
            >
              <TechboxNewsSidebar unreadSlugs={openedUnreadNewsSlugs} />
            </SidebarProvider>
            )}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
