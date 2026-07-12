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
import { HomeIcon } from "lucide-react"

export function TechboxAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      side="right"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HomeIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-bold">تکباکس</span>
                <span className="truncate text-xs text-muted-foreground">زیرساخت و فناوری اطلاعات</span>
              </div>
            </SidebarMenuButton>
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
