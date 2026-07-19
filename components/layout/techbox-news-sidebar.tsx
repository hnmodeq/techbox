"use client"

import * as React from "react"
import Link from "next/link"
import { NewspaperIcon } from "lucide-react"

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

export function TechboxNewsSidebar({ unreadSlugs = [] }: { unreadSlugs?: string[] }) {
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
    <Sidebar
      side="left"
      dir="rtl"
      variant="sidebar"
      collapsible="offcanvas"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
    >
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <NewspaperIcon className="size-4 text-muted-foreground" />
            <span className="text-sm font-bold text-foreground">اخبار زنده تکباکس</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <SidebarMenu>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SidebarMenuItem key={i} className="p-2">
                  <div className="h-16 w-full rounded-lg bg-muted animate-pulse" />
                </SidebarMenuItem>
              ))
            ) : newsItems.length === 0 ? (
              <SidebarMenuItem className="p-4 text-center text-xs text-muted-foreground">
                خبر جدیدی در ۲۴ ساعت گذشته ثبت نشده است.
              </SidebarMenuItem>
            ) : (
              newsItems.map((news) => {
                const isUnread = unreadSlugs.includes(news.slug)
                return (
                <SidebarMenuItem key={news.slug}>
                  <NewsSidebarCard news={news} isUnread={isUnread} />
                  <Separator className="my-1" />
                </SidebarMenuItem>
                )
              })
            )}
            {!loading && (
              <SidebarMenuItem className="p-2">
                <SidebarMenuButton
                  render={<Link href="/news" onClick={() => setOpen(false)} />}
                  className="h-auto justify-center py-2.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-600/10 hover:bg-red-600/20"
                >
                  بایگانی خبرها
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  )
}
