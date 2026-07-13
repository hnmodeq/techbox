"use client"

import * as React from "react"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { TechboxNavMain } from "./techbox-nav-main"
import { TechboxNavSecondary } from "./techbox-nav-secondary"
import { TechboxNavUser } from "./techbox-nav-user"
import Image from "next/image"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function TechboxAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      side="right"
      dir="rtl"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Tooltip>
              <TooltipTrigger render={<SidebarMenuButton size="lg" render={<Link href="/" />} />}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image src="/logo.png" alt="تکباکس" width={32} height={32} className="object-contain" />
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
    </Sidebar>
  )
}
