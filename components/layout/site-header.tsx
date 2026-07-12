"use client"

import * as React from "react"
import Link from "next/link"

import { SearchForm } from "./search-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { PanelLeftIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { moduleMeta } from "@/lib/content"
import { useTheme } from "next-themes"
import { MoonIcon, SunIcon } from "lucide-react"

type Crumb = {
  label: string
  href?: string
}

function buildCrumbs(pathname: string): Crumb[] {
  const parts = pathname.split("/").filter(Boolean)
  if (parts.length === 0) return [{ label: "خانه" }]

  const crumbs: Crumb[] = [{ label: "خانه", href: "/" }]
  let accumulated = ""

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    accumulated += `/${part}`
    // @ts-expect-error dynamic module lookup
    const meta = moduleMeta[part]
    if (meta) {
      crumbs.push({ label: meta.titleFa || meta.title || part, href: accumulated })
    } else {
      const label = decodeURIComponent(part).replace(/-/g, " ")
      if (i === parts.length - 1) {
        crumbs.push({ label })
      } else {
        crumbs.push({ label, href: accumulated })
      }
    }
  }

  return crumbs
}

function TechboxBreadcrumb() {
  const pathname = usePathname()
  const crumbs = React.useMemo(() => buildCrumbs(pathname), [pathname])

  if (crumbs.length <= 1) return null

  return (
    <Breadcrumb className="hidden sm:block">
      <BreadcrumbList>
        {crumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {index < crumbs.length - 1 && crumb.href ? (
                <BreadcrumbLink render={<Link href={crumb.href} />}>
                  {crumb.label}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="تغییر تم"
    >
      {isDark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
    </Button>
  )
}

type SiteHeaderProps = {
  hasUnreadNews?: boolean
}

export function SiteHeader({ hasUnreadNews = false }: SiteHeaderProps) {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <PanelLeftIcon className="rotate-180" />
        </Button>
        <Separator
          orientation="vertical"
          className="me-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <TechboxBreadcrumb />
        <SearchForm className="w-full sm:ms-auto sm:w-auto" />
        <Separator
          orientation="vertical"
          className="mx-1 data-vertical:h-4 data-vertical:self-auto"
        />
        <ThemeToggle />
      </div>
    </header>
  )
}
