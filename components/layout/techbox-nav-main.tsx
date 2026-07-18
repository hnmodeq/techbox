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
import { navItems as allNavItems, isActive } from "@/config/sidebar.config"
import { useEnabledModules, useModuleTitles } from "@/providers/module-config.provider"

/** Map sidebar href to module slug for enable/disable filtering */
const sidebarModuleMap: Record<string, string> = {
  "/": "home",
  "/blog": "blog",
  "/news": "news",
  "/media": "media",
  "/shop": "shop",
  "/tools": "tools",
  "/forum": "forum",
  "/review": "review",
  "/download": "download",
  "/timeline": "timeline",
};

export function TechboxNavMain() {
  const pathname = usePathname()
  const enabledModules = useEnabledModules()
  const moduleTitles = useModuleTitles()

  // Filter sidebar items based on enabled modules
  const navItems = allNavItems.filter((item) => {
    const slug = sidebarModuleMap[item.href];
    if (!slug || slug === "home") return true;
    return enabledModules.has(slug as any);
  })

  // Resolve a module display name from the source of truth (DB), falling back
  // to the static config title. This is the single place titles are decided.
  const resolveTitle = (href: string, fallback: string) => {
    const slug = sidebarModuleMap[href];
    if (!slug || slug === "home") return fallback;
    return (moduleTitles as Record<string, string>)[slug] || fallback;
  }

  return (
    <SidebarGroup>
      <SidebarMenu>
        {navItems.map((item) => {
          const active = isActive(pathname, item.href)
          const Icon = item.icon
          const hasChildren = Boolean(item.children?.length)
          return (
            <Collapsible
              key={`${item.title}-${active}`}
              defaultOpen={active}
              render={<SidebarMenuItem />}
            >
              <SidebarMenuButton
                isActive={active}
                tooltip={resolveTitle(item.href, item.title)}
                render={hasChildren ? <CollapsibleTrigger /> : <Link href={item.href} />}
              >
                <Icon className="size-4" />
                <span>{resolveTitle(item.href, item.title)}</span>
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
