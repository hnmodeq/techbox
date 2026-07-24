"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TechboxAppSidebar } from "./techbox-app-sidebar"
import { TechboxNewsSidebar } from "./techbox-news-sidebar"
import { SiteHeader } from "./site-header"
import FooterSection from "@/components/layout/Footer"
import { ConsultationProvider } from "@/providers/consultation.provider"
import { CompareProvider } from "@/providers/compare.provider"
import { StatsProvider } from "@/providers/stats.provider"
import { ThemeProvider } from "@/providers/theme.provider"
import { AuthProvider, useAuth } from "@/providers/auth.provider"
import { HomeDataProvider, type HomeData } from "@/features/home/lib/home-data"
import { ModuleConfigProvider } from "@/providers/module-config.provider"
import { TimelineLikesProvider } from "@/providers/timeline-likes.provider"
import { useHomeModule, useHomeTicker } from "@/features/home/lib/home-data"
import NewsTicker from "@/features/news/components/NewsTicker"
import type { SiteLayoutConfig } from "@/lib/module-config"

const ChatLauncherFallback = () => (
  <button
    type="button"
    aria-hidden
    tabIndex={-1}
    className="fixed bottom-5 left-5 rounded-full size-12 flex items-center justify-center bg-transparent text-foreground hover:bg-muted transition-colors"
  >
    <span className="size-5 rounded-full bg-muted-foreground/40" />
  </button>
)

const Chatbot = dynamic(() => import("@/features/chat/components/Chatbot"), {
  ssr: false,
  loading: () => <ChatLauncherFallback />,
})

import { AuthModal } from "@/features/auth/components/auth-modal"
import { HelpModals } from "@/components/layout/help-modals"
// FloatingSearch removed — search is now in the top bar (TopBarSearch)

type LayoutShellProps = {
  children: React.ReactNode
  homeData?: HomeData
  serverModuleConfig?: SiteLayoutConfig
}

export function LayoutShell({ children, homeData, serverModuleConfig }: LayoutShellProps) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")

  // Admin pages have their own layout — skip the main site chrome
  if (isAdmin) {
    return (
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <ConsultationProvider>
          <CompareProvider>
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
              {/* FloatingSearch removed — search is now in the top bar */}
            </HomeDataProvider>
            </StatsProvider>
          </CompareProvider>
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
  const newsSidebarRef = React.useRef<HTMLDivElement>(null)

  const { items: dbNews } = useHomeModule("news")
  const { items: tickerItems } = useHomeTicker()
  const newsSlugsKey = dbNews.map((item) => item.slug).filter(Boolean).join(",")
  const hasUnreadNews = unreadNewsSlugs.length > 0
  const lastFetchedReadStateKey = React.useRef<string>("")

  // Close when clicking outside the sidebar panel
  React.useEffect(() => {
    if (!newsOpen) return
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Element
      if (newsSidebarRef.current?.contains(target)) return
      if (target.closest("[data-news-toggle]")) return
      setNewsOpen(false)
    }
    document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [newsOpen])

  // Lock page scroll while cursor is over the news sidebar; unlock when it leaves or closes
  const lockScroll = React.useCallback(() => { document.body.style.overflow = "hidden" }, [])
  const unlockScroll = React.useCallback(() => { document.body.style.overflow = "" }, [])
  React.useEffect(() => { if (!newsOpen) document.body.style.overflow = "" }, [newsOpen])

  React.useEffect(() => {
    try {
      document.documentElement.dataset.newsSidebarOpen = String(newsOpen)
      localStorage.setItem("techbox-news-sidebar-open", String(newsOpen))
    } catch {}
  }, [newsOpen])

  React.useEffect(() => {
    let cancelled = false
    if (!userId || !newsSlugsKey) {
      setUnreadNewsSlugs((c) => (c.length ? [] : c))
      return
    }
    const fetchKey = `${userId}:${newsSlugsKey}`
    if (lastFetchedReadStateKey.current === fetchKey) return
    lastFetchedReadStateKey.current = fetchKey

    fetch(`/api/news/read-state?slugs=${encodeURIComponent(newsSlugsKey)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) {
          const next = Array.isArray(data?.unreadSlugs) ? data.unreadSlugs : []
          setUnreadNewsSlugs((c) => (c.join(",") === next.join(",") ? c : next))
        }
      })
      .catch(() => { if (!cancelled) setUnreadNewsSlugs((c) => (c.length ? [] : c)) })

    return () => { cancelled = true }
  }, [userId, newsSlugsKey])

  React.useEffect(() => {
    if (!newsOpen || !userId || !newsSlugsKey || unreadNewsSlugs.length === 0) return
    const slugs = newsSlugsKey.split(",").filter(Boolean)
    const unreadAtOpen = slugs.filter((s) => unreadNewsSlugs.includes(s))
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
          onToggleNews={() => setNewsOpen((o) => !o)}
        />

        <div
          className="flex min-h-[calc(100svh-var(--header-height))] w-full"
          dir="rtl"
        >
          <TechboxAppSidebar />

          <SidebarInset className="min-w-0 overflow-visible [container-type:inline-size]">
            {tickerItems.length > 0 && (
              <div className="border-b bg-background/95">
                <NewsTicker items={tickerItems} className="py-0" />
              </div>
            )}
            <main
              id="main-content"
              className="flex min-h-[calc(100svh-var(--header-height))] flex-col"
            >
              <div className="w-full max-w-full flex-1">{children}</div>
              <FooterSection />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>

      {/*
        News sidebar — fixed to the viewport, same as <Sidebar> in shadcn/ui.
        Uses top-(--header-height) which is Tailwind v4 CSS-variable syntax,
        identical to what TechboxAppSidebar uses — resolves to var(--header-height).
        The CSS variable is defined on the outermost div of LayoutInner.
        fixed means it is completely outside the document scroll flow.
      */}
      <div
        ref={newsSidebarRef}
        onMouseEnter={lockScroll}
        onMouseLeave={unlockScroll}
        className={`fixed left-0 top-(--header-height) h-[calc(100svh-var(--header-height))] z-40 hidden md:flex flex-col overflow-hidden border-r border-[var(--sidebar-border)] bg-[var(--sidebar-background)] transition-[width] duration-300 ease-in-out ${
          newsOpen ? "w-[20rem] shadow-xl" : "w-0 border-r-0"
        }`}
      >
        <TechboxNewsSidebar unreadSlugs={openedUnreadNewsSlugs} />

        {/* Rail — thin strip on the right (outer) edge, clicking closes the sidebar */}
        {newsOpen && (
          <button
            type="button"
            aria-label="بستن اخبار"
            onClick={() => setNewsOpen(false)}
            className="absolute inset-y-0 -right-3 z-20 w-3 cursor-w-resize after:absolute after:inset-y-0 after:start-1/2 after:w-[2px] hover:after:bg-sidebar-border transition-colors"
          />
        )}
      </div>
    </div>
  )
}
