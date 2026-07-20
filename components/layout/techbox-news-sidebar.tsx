"use client"

import * as React from "react"
import Link from "next/link"
import { NewspaperIcon, XIcon } from "lucide-react"

import { Separator } from "@/components/ui/separator"
import { useHomeModule } from "@/features/home/lib/home-data"
import { NewsSidebarCard } from "./news-sidebar-card"

export function TechboxNewsSidebar({ unreadSlugs = [], onClose }: { unreadSlugs?: string[]; onClose?: () => void }) {
  const { items: dbNews, loading } = useHomeModule("news")
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const sortedNews = [...dbNews].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const newsItems = sortedNews.slice(0, 15)

  // Trap wheel events so only the sidebar scrolls, not the page
  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = el
      const atTop = scrollTop === 0 && e.deltaY < 0
      const atBottom = scrollTop + clientHeight >= scrollHeight && e.deltaY > 0
      if (!atTop && !atBottom) {
        e.preventDefault()
        el.scrollTop += e.deltaY
      }
    }

    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [])

  return (
    <div className="flex h-full w-full flex-col bg-[var(--sidebar-background)] border-r border-[var(--sidebar-border)] shadow-2xl">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between px-4 border-b border-[var(--sidebar-border)]">
        <div className="flex items-center gap-2">
          <NewspaperIcon className="size-4 text-muted-foreground" />
          <span className="text-sm font-bold text-foreground">اخبار زنده تکباکس</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <XIcon className="size-4" />
            <span className="sr-only">بستن</span>
          </button>
        )}
      </div>

      {/* Scrollable content — wheel events are trapped so the page doesn't scroll */}
      <div
        ref={scrollRef}
        dir="rtl"
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ scrollbarWidth: "thin" }}
      >
        <div className="flex flex-col gap-1 py-2 w-full">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3 w-full">
                <div className="h-32 w-full rounded-lg bg-muted animate-pulse" />
              </div>
            ))
          ) : newsItems.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              خبر جدیدی وجود ندارد.
            </div>
          ) : (
            newsItems.map((news) => {
              const isUnread = unreadSlugs.includes(news.slug)
              return (
                <div key={news.slug} className="px-3 py-1.5 w-full flex flex-col items-center">
                  <NewsSidebarCard news={news} isUnread={isUnread} />
                </div>
              )
            })
          )}

          {!loading && (
            <div className="p-3 w-full">
              <Separator className="mb-3" />
              <Link
                href="/news"
                onClick={onClose}
                className="flex items-center justify-center w-full rounded-md py-2.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-600/10 hover:bg-red-600/20 transition-colors"
              >
                بایگانی خبرها
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
