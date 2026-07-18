"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { formatRelativeDate } from "@/lib/date-format";
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
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useHomeModule } from "@/features/home/lib/home-data"

export function TechboxNewsSidebar({ unreadSlugs = [] }: { unreadSlugs?: string[] }) {
  const { setOpen } = useSidebar()
  const { items: dbNews, loading } = useHomeModule("news")

  // Only show news from the last 24 hours (live-feel). Older news lives in /news.
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000
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
          <Button variant="ghost" size="icon-xs" onClick={() => setOpen(false)}>
            <XIcon className="size-4" />
          </Button>
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
                  <SidebarMenuButton
                    render={<Link href={`/news/${news.slug}`} />}
                    className="h-auto py-3 px-2"
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={news.image || "/assets/blog-1.jpg"}
                          alt={news.title}
                          fill
                          className="object-cover"
                          sizes="(min-width: 768px) 80px, 96px"
                          quality={95}
                        />
                        {isUnread && (
                          <span className="absolute top-1 right-1 size-2 rounded-full bg-red-500 ring-2 ring-background" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-start">
                        <div className="flex items-center gap-1.5">
                          {isUnread && <span className="size-1.5 shrink-0 rounded-full bg-red-500" />}
                          <div className="text-xs font-bold line-clamp-2 leading-5 text-foreground">
                            {news.title}
                          </div>
                        </div>
                        <div className="mt-1 text-[10px] text-muted-foreground">
                          {formatRelativeDate(news.date)}
                        </div>
                      </div>
                    </div>
                  </SidebarMenuButton>
                  <Separator className="my-1" />
                </SidebarMenuItem>
                )
              })
            )}
            {!loading && (
              <SidebarMenuItem className="p-2">
                <SidebarMenuButton
                  render={<Link href="/news" onClick={() => setOpen(false)} />}
                  className="h-auto justify-center py-2.5 text-xs font-bold text-red-600 hover:text-red-700"
                >
                  بایگانی خبر
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  )
}
