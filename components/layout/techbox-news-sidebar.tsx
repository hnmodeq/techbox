"use client"

import * as React from "react"
import Link from "next/link"
import { NewspaperIcon, XIcon } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useHomeModule } from "@/features/home/lib/home-data"
import { NewsSidebarCard } from "./news-sidebar-card"

export function TechboxNewsSidebar({ unreadSlugs = [], onClose }: { unreadSlugs?: string[]; onClose?: () => void }) {
  const { setOpen } = useSidebar()
  const { items: dbNews, loading } = useHomeModule("news")

  // Only show news from the last 24 hours (live-feel). Older news lives in /news.
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()
  const newsItems = dbNews
    .filter((n) => now - new Date(n.date).getTime() <= TWENTY_FOUR_HOURS)
    .slice(0, 15)

  return (
    <div className="flex h-full w-full flex-col bg-[var(--sidebar-background)] border-r border-[var(--sidebar-border)] shadow-2xl">
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
      
      <ScrollArea className="flex-1 w-full" dir="rtl">
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
      </ScrollArea>
    </div>
  )
}
