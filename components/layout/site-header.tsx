"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  BellIcon,
  CalendarDaysIcon,
  ClockIcon,
  MoonIcon,
  NewspaperIcon,
  PanelLeftIcon,
  SunIcon,
} from "lucide-react"

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSidebar } from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { moduleMeta } from "@/lib/content"
import { cn } from "@/lib/utils"

type Crumb = {
  label: string
  href?: string
}

type NotificationItem = {
  id: string
  label: string
  title: string
  text: string
  module: string
  slug: string
  createdAt: string
  read?: boolean
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
    <Breadcrumb className="hidden min-w-0 lg:block">
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isCurrent = index === crumbs.length - 1
          const tooltipText = isCurrent ? "you're here" : `Going to ${crumb.label}`

          return (
            <React.Fragment key={index}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      isCurrent || !crumb.href ? (
                        <BreadcrumbPage />
                      ) : (
                        <BreadcrumbLink render={<Link href={crumb.href} />} />
                      )
                    }
                  >
                    {crumb.label}
                  </TooltipTrigger>
                  <TooltipContent>{tooltipText}</TooltipContent>
                </Tooltip>
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function MonthCalendar({ date }: { date: Date }) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const today = new Date()
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leadingDays = (firstDay.getDay() + 1) % 7 // Persian week starts on Saturday.
  const cells = Array.from({ length: leadingDays + daysInMonth }, (_, index) =>
    index < leadingDays ? null : index - leadingDays + 1
  )

  return (
    <div className="space-y-3" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="font-bold">
          {date.toLocaleDateString("fa-IR", { month: "long", year: "numeric" })}
        </div>
        <CalendarDaysIcon className="size-4 text-muted-foreground" />
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
        {["ش", "ی", "د", "س", "چ", "پ", "ج"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {cells.map((day, index) => {
          const isToday =
            day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
          return (
            <span
              key={index}
              className={cn(
                "flex h-7 items-center justify-center rounded-md",
                day ? "bg-muted/40" : "bg-transparent",
                isToday && "bg-primary text-primary-foreground font-bold"
              )}
            >
              {day ? new Intl.NumberFormat("fa-IR").format(day) : ""}
            </span>
          )
        })}
      </div>
    </div>
  )
}

function DateTimeDisplay() {
  const [now, setNow] = React.useState(new Date())
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const timeStr = now.toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  const dateStr = now.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="hidden items-center gap-2 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted md:flex"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
          />
        }
      >
        <ClockIcon className="size-3.5" />
        <span>{timeStr}</span>
        <span className="text-muted-foreground/50">•</span>
        <span>{dateStr}</span>
      </PopoverTrigger>
      <PopoverContent
        className="w-72"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <MonthCalendar date={now} />
      </PopoverContent>
    </Popover>
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
      title={isDark ? "حالت روشن" : "حالت تاریک"}
    >
      {isDark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
    </Button>
  )
}

function NotificationsButton() {
  const [open, setOpen] = React.useState(false)
  const [items, setItems] = React.useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [loading, setLoading] = React.useState(false)

  const loadNotifications = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" })
      const data = await res.json()
      setItems(data?.items || [])
      setUnreadCount(data?.unreadCount || 0)
    } catch {
      setItems([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  React.useEffect(() => {
    if (!open || unreadCount === 0) return
    fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastReadAt: new Date().toISOString() }),
    }).catch(() => {})
    setUnreadCount(0)
    setItems((prev) => prev.map((item) => ({ ...item, read: true })))
  }, [open, unreadCount])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="relative"
              aria-label="اعلان‌ها"
              onClick={() => setOpen(true)}
            />
          }
        >
          <BellIcon className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          )}
        </TooltipTrigger>
        <TooltipContent>
          {unreadCount > 0 ? "you have unread messages" : "اعلان جدیدی ندارید"}
        </TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>اعلان‌ها</DialogTitle>
          <DialogDescription>آخرین دیدگاه‌ها و واکنش‌ها به نوشته‌های شما</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[55vh] pe-2">
          <div className="space-y-2">
            {loading ? (
              <div className="rounded-lg border bg-muted/40 p-4 text-center text-muted-foreground">
                در حال دریافت اعلان‌ها…
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-lg border bg-muted/40 p-4 text-center text-muted-foreground">
                هنوز اعلانی برای نمایش وجود ندارد.
              </div>
            ) : (
              items.map((item) => (
                <Link
                  key={item.id}
                  href={`/${item.module}/${item.slug}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg border bg-card p-3 transition-colors hover:bg-muted/60"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold">{item.label}</span>
                    {!item.read && <span className="h-2 w-2 rounded-full bg-red-500" />}
                  </div>
                  <p className="mt-1 line-clamp-2 text-muted-foreground">{item.title}</p>
                  {item.text && <p className="mt-1 line-clamp-2 text-xs">{item.text}</p>}
                </Link>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

type SiteHeaderProps = {
  hasUnreadNews?: boolean
  newsOpen?: boolean
  onToggleNews?: () => void
}

export function SiteHeader({
  hasUnreadNews = false,
  newsOpen = false,
  onToggleNews,
}: SiteHeaderProps) {
  const { toggleSidebar, state } = useSidebar()
  const sidebarTooltip = state === "expanded" ? "closing the side menu" : "open the side menu"

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="flex h-(--header-height) w-full items-center justify-around gap-3 px-4">
        <div className="flex min-w-0 flex-1 items-center justify-start gap-2">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  className="h-8 w-8 shrink-0"
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                />
              }
            >
              <PanelLeftIcon className="rotate-180" />
            </TooltipTrigger>
            <TooltipContent>{sidebarTooltip}</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="data-vertical:h-4 data-vertical:self-auto" />
          <NotificationsButton />
          <TechboxBreadcrumb />
        </div>

        <div className="flex flex-[1.2] justify-center px-2">
          <SearchForm className="w-full max-w-md" />
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
          <DateTimeDisplay />
          <ThemeToggle />
          {onToggleNews && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant={newsOpen ? "secondary" : "ghost"}
                    size="sm"
                    className="relative gap-1.5"
                    onClick={onToggleNews}
                    aria-pressed={newsOpen}
                    aria-label="اخبار زنده تکباکس"
                  />
                }
              >
                {hasUnreadNews && <span className="h-2 w-2 rounded-full bg-red-500" />}
                <NewspaperIcon className="size-4" />
                <span className="hidden sm:inline">اخبار</span>
              </TooltipTrigger>
              <TooltipContent>{hasUnreadNews ? "unreaded news" : "no new news"}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </header>
  )
}
