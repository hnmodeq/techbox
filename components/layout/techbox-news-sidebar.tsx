"use client"

import * as React from "react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { useHomeModule } from "@/features/home/lib/home-data"
import { NewsSidebarCard } from "./news-sidebar-card"

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

export function TechboxNewsSidebar({ unreadSlugs = [] }: { unreadSlugs?: string[] }) {
  const { items: dbNews, loading } = useHomeModule("news")

  const newsItems = React.useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now()
    return [...dbNews]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter((n) => now - new Date(n.date).getTime() <= TWENTY_FOUR_HOURS)
      .slice(0, 15)
  }, [dbNews])

  return (
    <div dir="rtl" className="h-full overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
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
          newsItems.map((news) => (
            <div key={news.slug} className="px-3 py-1.5 w-full flex flex-col items-center">
              <NewsSidebarCard news={news} isUnread={unreadSlugs.includes(news.slug)} />
            </div>
          ))
        )}

        {!loading && (
          <div className="p-3 w-full">
            <Separator className="mb-3" />
            <Link
              href="/news"
              className="flex items-center justify-center w-full rounded-md py-2.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-600/10 hover:bg-red-600/20 transition-colors"
            >
              بایگانی خبرها
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
