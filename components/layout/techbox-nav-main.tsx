"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { ChevronRightIcon } from "lucide-react"
import { navItems, isActive } from "@/config/sidebar.config"

export function TechboxNavMain() {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarMenu>
        {navItems.map((item) => {
          const active = isActive(pathname, item.href)
          const Icon = item.icon
          const hasChildren = Boolean(item.children?.length)
          return (
            <Collapsible
              key={item.title}
              defaultOpen={active}
              render={<SidebarMenuItem />}
            >
              <SidebarMenuButton
                isActive={active}
                tooltip={item.title}
                render={hasChildren ? <CollapsibleTrigger /> : <Link href={item.href} />}
              >
                <Icon className="size-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
              {item.children?.length ? (
                <>
                  <SidebarMenuAction
                    render={<CollapsibleTrigger />}
                    className="aria-expanded:rotate-90"
                  >
                    <ChevronRightIcon className="size-4" />
                    <span className="sr-only">Toggle</span>
                  </SidebarMenuAction>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.children.map((sub) => {
                        const SubIcon = sub.icon
                        return (
                          <SidebarMenuSubItem key={sub.title}>
                            <SidebarMenuSubButton
                              isActive={isActive(pathname, sub.href)}
                              render={<Link href={sub.href} />}
                            >
                              <SubIcon className="size-3.5" />
                              <span>{sub.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
