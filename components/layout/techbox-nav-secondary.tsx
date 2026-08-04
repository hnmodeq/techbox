"use client"

import * as React from "react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { TicketIcon, HelpCircleIcon } from "lucide-react"

export function TechboxNavSecondary({ ...props }: React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const items = [
    {
      title: "مشاوره",
      event: "tb_open_support",
      icon: TicketIcon,
      className: "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300",
    },
    {
      title: "سوالات پرتکرار",
      event: "tb_open_faq",
      icon: HelpCircleIcon,
      className: undefined,
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
                  className={item.className}
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
