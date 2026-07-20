"use client"

import * as React from "react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { TicketIcon, SendIcon, HelpCircleIcon, BadgeCheckIcon } from "lucide-react"

export function TechboxNavSecondary({ ...props }: React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const items = [
    {
      title: "تیکت پشتیبانی",
      event: "tb_open_support",
      icon: TicketIcon,
    },
    {
      title: "پیشنهادات",
      event: "tb_open_feedback",
      icon: SendIcon,
    },
    {
      title: "سوالات پرتکرار",
      event: "tb_open_faq",
      icon: HelpCircleIcon,
    },
  ]

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  size="sm"
                  onClick={() => window.dispatchEvent(new CustomEvent(item.event))}
                >
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
