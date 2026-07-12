"use client"

import * as React from "react"
import Link from "next/link"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LifeBuoyIcon, SendIcon } from "lucide-react"

const items = [
  {
    title: "پشتیبانی",
    url: "/support",
    icon: LifeBuoyIcon,
  },
  {
    title: "ارسال بازخورد",
    url: "/feedback",
    icon: SendIcon,
  },
]

export function TechboxNavSecondary({ ...props }: React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton size="sm" render={<Link href={item.url} />}>
                  <Icon className="size-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
