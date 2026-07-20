"use client"

import * as React from "react"
import Link from "next/link"
import { NewspaperIcon, XIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useHomeModule } from "@/features/home/lib/home-data"
import { NewsSidebarCard } from "./news-sidebar-card"

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

interface TechboxNewsSidebarProps {
  unreadSlugs?: string[]
  onClose?: () => void
  /** Forwarded ref so the parent (LayoutShell) can redirect wheel events here */
  scrollRef?: React.RefObject<HTMLDivElement | null>
}

export function TechboxNewsSidebar({
  unreadSlugs = [],
  onClose,
  scrollRef,
}: TechboxNewsSidebarProps) {
  const { items: dbNews, loading } = useHomeModule("news")
  // Internal fallback ref if the parent doesn't provide one
  const internalScrollRef = React.useRef<HTMLDivElement>(null)
  const resolvedScrollRef = scrollRef ?? internalScrollRef

  // Only news published in the last 24 hours
  const newsItems = React.useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now()
    return [...dbNews]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter((n) => now - new Date(n.date).getTime() <= TWENTY_FOUR_HOURS)
      .slice(0, 15)
  }, [dbNews])

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

      {/* Scrollable content */}
      <div
        ref={resolvedScrollRef}
        dir="rtl"
        className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: "thin", overscrollBehavior: "contain" }}
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
              خبر جدیدی در ۲۴ ساعت گذشته ثبت نشده است.
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
