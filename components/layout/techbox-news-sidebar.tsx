"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
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

export function TechboxNewsSidebar() {
  const { setOpen } = useSidebar()
  const { items: dbNews, loading } = useHomeModule("news")
  const newsItems = dbNews.slice(0, 15)

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
                هنوز خبری ثبت نشده است.
              </SidebarMenuItem>
            ) : (
              newsItems.map((news) => (
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
                      </div>
                      <div className="flex-1 min-w-0 text-start">
                        <div className="text-xs font-bold line-clamp-2 leading-5 text-foreground">
                          {news.title}
                        </div>
                        <div className="mt-1 text-[10px] text-muted-foreground">
                          {news.date_fa}
                        </div>
                      </div>
                    </div>
                  </SidebarMenuButton>
                  <Separator className="my-1" />
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  )
}
