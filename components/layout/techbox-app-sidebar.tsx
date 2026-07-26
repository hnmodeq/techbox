"use client"

import Link from "next/link"
import * as React from "react"

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar"
import { TechboxNavMain } from "./techbox-nav-main"
import { TechboxNavSecondary } from "./techbox-nav-secondary"
import { TechboxNavUser } from "./techbox-nav-user"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

/**
 * Main site sidebar.
 *
 * Renders in `overlay` mode: it floats above the page rather than
 * consuming ~14rem of layout width, mirroring how the news sidebar in
 * LayoutShell already behaves. Before this change the homepage had only
 * ~1010px of usable canvas at a 1280px viewport, which cramped the
 * full-width Finder and the 3-up Top Picks grid.
 *
 * Docs: docs/homepage-upgrade/02-DESIGN-SPEC.md §1.5 (decision D3)
 */
export function TechboxAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      side="right"
      dir="rtl"
      overlay
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Tooltip>
              <TooltipTrigger render={<SidebarMenuButton size="lg" render={<Link href="/" />} />}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.png" alt="تکباکس" width={32} height={32} className="object-contain" />
                </div>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-bold">تکباکس</span>
                  <span className="truncate text-xs text-muted-foreground">پاتوق بچه‌های فناوری اطلاعات</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>رسانه تکنولوژی تکباکس</TooltipContent>
            </Tooltip>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <TechboxNavMain />
        <TechboxNavSecondary className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <TechboxNavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
