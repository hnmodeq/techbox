"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  BellIcon,
  CalendarDaysIcon,
  MoonIcon,
  NewspaperIcon,
  PanelLeftIcon,
  ShoppingCartIcon,
  SunIcon,
} from "lucide-react"
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
import { moduleMeta, type ModuleSlug } from "@/lib/content"
import {
  getDaysInJalaliMonth,
  getPersianDayName,
  getPersianMonthName,
  gregorianToJalali,
  jalaliToGregorian,
} from "@/lib/jalali"
import { cn } from "@/lib/utils"
import { useConsultation } from "@/providers/consultation.provider"

type Crumb = {
  label: string
  href?: string
}

const pageTitleFa: Record<string, string> = {
  search: "جستجو",
  about: "درباره ما",
  account: "حساب کاربری",
  admin: "مدیریت",
  contact: "تماس با ما",
  consultation: "مشاوره",
  feedback: "بازخورد",
  support: "پشتیبانی",
  timeline: "تایم‌لاین",
  tools: "ابزارها",
  "work-with-us": "همکاری با ما",
  landing: "لندینگ محصولات",
  storage: "ذخیره‌ساز",
  shop: "لیست محصولات",
  buying: "تکمیل خرید",
  compare: "مقایسه محصولات",
  order: "سفارش",
}

const contentModules: ModuleSlug[] = ["blog", "news", "media", "review", "download", "shop", "forum", "tools"]

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

function buildCrumbs(pathname: string, dynamicTitle?: string, searchQuery?: string | null, authorName?: string): Crumb[] {
  const parts = pathname.split("/").filter(Boolean)
  if (parts.length === 0) return [{ label: "خانه" }]

  const crumbs: Crumb[] = [{ label: "خانه", href: "/" }]
  let accumulated = ""

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    accumulated += `/${part}`
    const isCurrent = i === parts.length - 1
    const meta = moduleMeta[part as ModuleSlug]

    if (part === "author") {
      // Always show "حساب کاربری" — never the job title
      crumbs.push({ label: "حساب کاربری", href: isCurrent ? undefined : accumulated })
    } else if (parts[0] === "author" && i === 1) {
      // Show Persian name once loaded; decoded slug until then (no flicker with English)
      const fallback = decodeURIComponent(part).replace(/-/g, " ")
      crumbs.push({ label: authorName || fallback })
    } else if (meta) {
      crumbs.push({ label: meta.titleFa || meta.title || part, href: isCurrent ? undefined : accumulated })
    } else if (part === "search") {
      crumbs.push({ label: searchQuery ? `جستجو: ${searchQuery}` : "جستجو", href: isCurrent ? undefined : accumulated })
    } else if (dynamicTitle && isCurrent) {
      crumbs.push({ label: dynamicTitle })
    } else {
      const label = pageTitleFa[part] || decodeURIComponent(part).replace(/-/g, " ")
      crumbs.push({ label, href: isCurrent ? undefined : accumulated })
    }
  }

  return crumbs
}

function TechboxBreadcrumb() {
  const pathname = usePathname()
  const [dynamicTitle, setDynamicTitle] = React.useState<string>("")
  const [authorName, setAuthorName] = React.useState<string>("")
  const [searchQuery, setSearchQuery] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (pathname !== "/search") {
      setSearchQuery(null)
      return
    }
    setSearchQuery(new URLSearchParams(window.location.search).get("q"))
  }, [pathname])

  React.useEffect(() => {
    const parts = pathname.split("/").filter(Boolean)
    const firstPart = parts[0]
    const moduleKey = firstPart as ModuleSlug | undefined
    const slug = parts[1]

    if (firstPart === "author" && slug) {
      setDynamicTitle("")
      let cancelled = false
      fetch(`/api/users/public/${encodeURIComponent(slug)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((profile) => {
          if (!cancelled && profile?.name) {
            // Only update state when value actually changes to avoid re-render loops
            setAuthorName((prev) => (prev === profile.name ? prev : profile.name))
          }
        })
        .catch(() => {})
      return () => { cancelled = true }
    }

    // Non-author route: clear author name without triggering extra renders
    setAuthorName((prev) => (prev === "" ? prev : ""))

    if (!moduleKey || !slug || !contentModules.includes(moduleKey)) {
      setDynamicTitle("")
      return
    }

    let cancelled = false
    fetch(`/api/posts?module=${encodeURIComponent(moduleKey)}&slug=${encodeURIComponent(slug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((post) => {
        if (!cancelled) {
          const title = post?.title || ""
          setDynamicTitle((prev) => (prev === title ? prev : title))
        }
      })
      .catch(() => {
        if (!cancelled) setDynamicTitle("")
      })

    return () => { cancelled = true }
  }, [pathname])

  const crumbs = React.useMemo(() => buildCrumbs(pathname, dynamicTitle, searchQuery, authorName), [pathname, dynamicTitle, searchQuery, authorName])

  if (crumbs.length <= 1) return null

  return (
    <Breadcrumb className="hidden lg:block shrink-0">
      <BreadcrumbList className="flex-nowrap whitespace-nowrap">
        {crumbs.map((crumb, index) => {
          const isCurrent = index === crumbs.length - 1
          const tooltipText = isCurrent ? "اینجا هستید" : `رفتن به ${crumb.label}`

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

type TehranJalaliSnapshot = {
  gregorianYear: number
  gregorianMonth: number
  gregorianDay: number
  hour: number
  minute: number
  second: number
  jalaliYear: number
  jalaliMonth: number
  jalaliDay: number
  dayIndex: number
}

const persianDigits = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)] ?? digit)

function getTehranParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  })
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]))
  const hour = Number(parts.hour || 0)

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: hour === 24 ? 0 : hour,
    minute: Number(parts.minute || 0),
    second: Number(parts.second || 0),
  }
}

function getTehranJalaliSnapshot(date: Date): TehranJalaliSnapshot {
  const tehran = getTehranParts(date)
  const wallDate = new Date(tehran.year, tehran.month - 1, tehran.day)
  const jalali = gregorianToJalali(wallDate)

  return {
    gregorianYear: tehran.year,
    gregorianMonth: tehran.month,
    gregorianDay: tehran.day,
    hour: tehran.hour,
    minute: tehran.minute,
    second: tehran.second,
    jalaliYear: jalali.year,
    jalaliMonth: jalali.month,
    jalaliDay: jalali.day,
    dayIndex: wallDate.getDay(),
  }
}

function formatSnapshotTime(snapshot: TehranJalaliSnapshot) {
  const time = [snapshot.hour, snapshot.minute, snapshot.second]
    .map((part) => String(part).padStart(2, "0"))
    .join(":")
  return persianDigits(time)
}

function formatSnapshotDate(snapshot: TehranJalaliSnapshot) {
  return `${getPersianDayName(snapshot.dayIndex)} ${persianDigits(snapshot.jalaliDay)} ${getPersianMonthName(snapshot.jalaliMonth)} ${persianDigits(snapshot.jalaliYear)}`
}

const MonthCalendar = React.memo(function MonthCalendar({ today }: { today: TehranJalaliSnapshot }) {
  const year = today.jalaliYear
  const month = today.jalaliMonth
  const firstGregorian = jalaliToGregorian(year, month, 1)
  const firstDay = new Date(firstGregorian.year, firstGregorian.month - 1, firstGregorian.day)
  const daysInMonth = getDaysInJalaliMonth(month, year)
  const leadingDays = (firstDay.getDay() + 1) % 7
  const cells = Array.from({ length: leadingDays + daysInMonth }, (_, index) =>
    index < leadingDays ? null : index - leadingDays + 1
  )

  // Pre-compute Fridays — these are always red, no fetch needed
  const fridays = React.useMemo(() => {
    const set = new Set<number>()
    cells.forEach((day, index) => {
      if (day === null) return
      // Friday = last column (index 6, 13, 20...) which is "ج" (جمعه).
      // The old code used (index + 1) % 7 === 6 which targeted "پ" (Thursday).
      if (index % 7 === 6) set.add(day)
    })
    return set
  }, [cells])

  // Only fetch custom holidays (non-Friday off days)
  const [customHolidayDays, setCustomHolidayDays] = React.useState<Set<number>>(new Set())

  React.useEffect(() => {
    if (year && month) {
      fetch(`/api/holidays?year=${year}&month=${month}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          const days = new Set<number>()
          if (data?.enabled && Array.isArray(data.holidays)) {
            for (const h of data.holidays) {
              const parts = h.jalaliDate?.split("/")
              if (parts?.length === 3) {
                const hDay = parseInt(parts[2], 10)
                if (!isNaN(hDay) && !fridays.has(hDay)) days.add(hDay)
              }
            }
          }
          setCustomHolidayDays(days)
        })
        .catch(() => {})
    }
  }, [year, month, fridays])

  return (
    <div className="space-y-3" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="font-bold">
          {getPersianMonthName(month)} {persianDigits(year)}
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
          const isToday = day === today.jalaliDay
          const isFriday = day !== null && fridays.has(day)
          const isCustomOff = day !== null && customHolidayDays.has(day)
          return (
            <span
              key={index}
              className={cn(
                "flex h-7 items-center justify-center rounded-md",
                day ? "bg-muted/40" : "bg-transparent",
                isToday && "bg-primary text-primary-foreground font-bold",
                !isToday && isFriday && "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold",
                !isToday && isCustomOff && "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold"
              )}
            >
              {day ? persianDigits(day) : ""}
            </span>
          )
        })}
      </div>
    </div>
  )
}, (prev, next) =>
  prev.today.jalaliYear === next.today.jalaliYear &&
  prev.today.jalaliMonth === next.today.jalaliMonth &&
  prev.today.jalaliDay === next.today.jalaliDay
)

function DateTimeDisplay() {
  const [mounted, setMounted] = React.useState(false)
  const [now, setNow] = React.useState<Date | null>(null)
  const [open, setOpen] = React.useState(false)
  const hoverRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    setMounted(true)
    const updateNow = () => setNow(new Date())
    updateNow()
    const timer = setInterval(updateNow, 1000)
    return () => clearInterval(timer)
  }, [])

  const snapshot = React.useMemo(() => (now ? getTehranJalaliSnapshot(now) : null), [now])
  const timeStr = snapshot ? formatSnapshotTime(snapshot) : null
  const dateStr = snapshot ? formatSnapshotDate(snapshot) : null

  const handleMouseEnter = () => {
    if (hoverRef.current) clearTimeout(hoverRef.current)
    hoverRef.current = setTimeout(() => setOpen(true), 200)
  }
  const handleMouseLeave = () => {
    if (hoverRef.current) clearTimeout(hoverRef.current)
    hoverRef.current = setTimeout(() => setOpen(false), 300)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="hidden h-8 min-w-[12rem] items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-1 text-xs text-muted-foreground md:flex"
            suppressHydrationWarning
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        }
      >
        {mounted && snapshot ? (
          <>
            <span className="tabular-nums">{timeStr}</span>
            <span className="text-muted-foreground/50">•</span>
            <span>{dateStr}</span>
          </>
        ) : (
          <span className="inline-block h-3.5 w-32 animate-pulse rounded bg-muted-foreground/20" aria-hidden="true" />
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-72"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {snapshot ? (
          <MonthCalendar today={snapshot} />
        ) : (
          <div className="h-52 animate-pulse rounded-md bg-muted/40" aria-hidden="true" />
        )}
      </PopoverContent>
    </Popover>
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  // During SSR and before hydration, always show moon (light mode default).
  // The icon flips after hydration if the user prefers dark mode.
  const isDark = mounted && resolvedTheme === "dark"
  const label = !mounted ? "تغییر تم" : isDark ? "حالت روشن" : "حالت تاریک"

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="تغییر تم"
          />
        }
      >
        <span suppressHydrationWarning>
          {isDark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function NotificationsButton() {
  const [open, setOpen] = React.useState(false)
  const [items, setItems] = React.useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [unreadIdsOnOpen, setUnreadIdsOnOpen] = React.useState<string[]>([])
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
    const openNotifications = () => setOpen(true)
    window.addEventListener("tb_open_notifications", openNotifications)
    return () => window.removeEventListener("tb_open_notifications", openNotifications)
  }, [])

  React.useEffect(() => {
    if (!open || unreadCount === 0) return
    setUnreadIdsOnOpen(items.filter((item) => !item.read).map((item) => item.id))
    fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastReadAt: new Date().toISOString() }),
    }).catch(() => {})
    setUnreadCount(0)
  }, [open, unreadCount, items])

  React.useEffect(() => {
    if (!open) {
      setUnreadIdsOnOpen([])
      setItems((prev) => prev.map((item) => ({ ...item, read: true })))
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="relative"
                  aria-label="اعلان‌ها"
                />
              }
            />
          }
        >
          <BellIcon className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" /></span>
          )}
        </TooltipTrigger>
        <TooltipContent>
          {unreadCount > 0 ? "اعلان خوانده‌نشده دارید" : "اعلان جدیدی ندارید"}
        </TooltipContent>
      </Tooltip>
      <PopoverContent className="w-[min(24rem,calc(100vw-2rem))] p-2" align="end">
        <div className="space-y-2" dir="rtl">
          <div className="px-2 py-1">
            <div className="text-sm font-bold">اعلان‌ها</div>
            <div className="text-xs text-muted-foreground">آخرین دیدگاه‌ها و واکنش‌ها</div>
          </div>
          <ScrollArea className="h-80 pe-2">
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
                    className="block rounded-lg border bg-card p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold">{item.label}</span>
                      {(!item.read || unreadIdsOnOpen.includes(item.id)) && <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />}
                    </div>
                    <p className="mt-1 line-clamp-2 text-muted-foreground">{item.title}</p>
                    {item.text && <p className="mt-1 line-clamp-2 text-xs">{item.text}</p>}
                  </Link>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}

type SiteHeaderProps = {
  hasUnreadNews?: boolean
  newsOpen?: boolean
  onToggleNews?: () => void
}

function CartButton() {
  const { count, setOpen } = useConsultation()

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="relative"
            onClick={() => setOpen(true)}
            aria-label="سبد خرید"
          />
        }
      >
        <ShoppingCartIcon className="size-4" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ef394e] px-0.5 text-[9px] font-bold text-white">
            {count.toLocaleString("fa-IR")}
          </span>
        )}
      </TooltipTrigger>
      <TooltipContent>سبد خرید</TooltipContent>
    </Tooltip>
  )
}

export function SiteHeader({
  hasUnreadNews = false,
  newsOpen = false,
  onToggleNews,
}: SiteHeaderProps) {
  const { toggleSidebar, state } = useSidebar()
  const sidebarTooltip = state === "expanded" ? "بستن منو" : "باز کردن منو"

  return (
    <header
      className="sticky top-0 z-50 flex w-full items-center border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80"
      suppressHydrationWarning
    >
      <div className="flex h-(--header-height) w-full items-center justify-around gap-3 px-4">
        <div className="flex min-w-0 flex-[2] items-center justify-start gap-2">
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
          <CartButton />
          <NotificationsButton />
          <ThemeToggle />
          <TechboxBreadcrumb />
          {/* Removed separator after breadcrumb */}
        </div>

        <div className="flex flex-[1.2] justify-center px-2">
          {/* Search moved to floating bottom-center component */}
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
          <DateTimeDisplay />
          {onToggleNews && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    size="sm"
                    className="relative gap-1.5 bg-red-600 hover:bg-red-700 text-white border-red-600 px-6"
                    onClick={onToggleNews}
                    aria-pressed={newsOpen}
                    aria-label="اخبار زنده تکباکس"
                    data-news-toggle="true"
                  />
                }
              >
                {hasUnreadNews && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/40 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white ring-2 ring-red-600" />
                  </span>
                )}
                <span className="text-xs sm:text-sm font-bold">خبر</span>
              </TooltipTrigger>
              <TooltipContent>{hasUnreadNews ? "خبر جدید" : "خبر جدیدی نیست"}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </header>
  )
}
