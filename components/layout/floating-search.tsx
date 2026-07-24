"use client"

import * as React from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { SearchIcon, Trash2Icon, ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import type { ModuleSlug } from "@/lib/content"

const RECENT_KEY = "techbox-recent-searches"

type SearchModule = "all" | Extract<ModuleSlug, "news" | "blog" | "media" | "shop" | "forum" | "review" | "download">

const searchModules: Array<{ value: SearchModule; label: string }> = [
  { value: "all",      label: "همه" },
  { value: "news",     label: "اخبار" },
  { value: "blog",     label: "مجله" },
  { value: "media",    label: "ویدیوهای کوتاه" },
  { value: "shop",     label: "فروشگاه" },
  { value: "forum",    label: "انجمن" },
  { value: "review",   label: "نقد و بررسی" },
  { value: "download", label: "دانلود" },
]

function isSearchModule(v: string | null): v is SearchModule {
  return Boolean(v && searchModules.some((m) => m.value === v))
}

// Shared visual style for pill + drop-ups
// NOTE: no backdrop-blur on drop-ups — it causes blurry text when layered
const PILL_BG = "bg-background/90 backdrop-blur-md border border-border/80"
const DROPUP_BG = "bg-popover border border-border/80"

export function FloatingSearch() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const [value,      setValue]      = React.useState("")
  const [module,     setModule]     = React.useState<SearchModule>("all")
  const [expanded,   setExpanded]   = React.useState(false)
  const [recentOpen, setRecentOpen] = React.useState(false)
  const [catOpen,    setCatOpen]    = React.useState(false)
  const [recent,     setRecent]     = React.useState<string[]>([])

  const rootRef       = React.useRef<HTMLDivElement>(null)
  const inputRef      = React.useRef<HTMLInputElement>(null)
  const inputWrapRef  = React.useRef<HTMLDivElement>(null)
  const catWrapRef    = React.useRef<HTMLDivElement>(null)
  const hoverRef      = React.useRef(false)
  const collapseTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync with URL when on /search page
  React.useEffect(() => {
    if (pathname !== "/search") return
    setValue(searchParams.get("q") || "")
    const m = searchParams.get("module")
    setModule(isSearchModule(m) ? m : "all")
  }, [pathname, searchParams])

  // Load recent searches from localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY)
      if (stored) setRecent(JSON.parse(stored))
    } catch {}
  }, [])

  const saveSearch = React.useCallback((q: string) => {
    setRecent((prev) => {
      const next = [q, ...prev.filter((i) => i !== q)].slice(0, 8)
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const clearRecent = React.useCallback(() => {
    setRecent([])
    try { localStorage.removeItem(RECENT_KEY) } catch {}
  }, [])

  const goSearch = React.useCallback((q: string, mod: SearchModule = module) => {
    const trimmed = q.trim()
    if (!trimmed) return
    saveSearch(trimmed)
    setRecentOpen(false)
    setCatOpen(false)
    // Clear the input after navigating
    setValue("")
    const params = new URLSearchParams({ q: trimmed })
    if (mod !== "all") params.set("module", mod)
    router.push(`/search?${params.toString()}`)
  }, [module, router, saveSearch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    goSearch(value)
  }

  const scheduleCollapse = React.useCallback(() => {
    if (collapseTimer.current) clearTimeout(collapseTimer.current)
    collapseTimer.current = setTimeout(() => {
      if (!hoverRef.current) {
        setExpanded(false)
        setRecentOpen(false)
        setCatOpen(false)
      }
    }, 200)
  }, [])

  const handleMouseEnter = React.useCallback(() => {
    hoverRef.current = true
    if (collapseTimer.current) clearTimeout(collapseTimer.current)
    setExpanded(true)
  }, [])

  const handleMouseLeave = React.useCallback(() => {
    hoverRef.current = false
    scheduleCollapse()
  }, [scheduleCollapse])

  React.useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setRecentOpen(false)
        setCatOpen(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [])

  const query          = value.trim().toLowerCase()
  const filteredRecent = query
    ? recent.filter((r) => r.toLowerCase().includes(query))
    : recent

  const selectedLabel = searchModules.find((m) => m.value === module)?.label || "همه"

  return (
    <TooltipProvider>
      <div
        ref={rootRef}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50"
        dir="rtl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* ── Main pill ── */}
        <form
          onSubmit={handleSubmit}
          className={cn(
            "flex items-center gap-1 rounded-full shadow-lg px-2.5 py-1.5 transition-[opacity] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]",
            PILL_BG,
            expanded ? "opacity-100" : "opacity-50"
          )}
        >
          {/* Search icon — LEFT side in LTR layout (right side visually in RTL pill) */}
          <button
            type="submit"
            aria-label="جستجو"
            className="flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <SearchIcon className="size-3.5" />
          </button>

          {/* Input — with its own relative wrapper for the recent drop-up */}
          <div ref={inputWrapRef} className="relative">
            {/* ── Recent searches drop-up — anchored above the input wrapper ── */}
            <div
              className={cn(
                "absolute bottom-[calc(100%+10px)] right-0 left-0 overflow-hidden rounded-xl shadow-lg transition-all duration-300 ease-out",
                DROPUP_BG,
                recentOpen && filteredRecent.length > 0 && expanded
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 translate-y-2 pointer-events-none"
              )}
            >
              <div className="p-1.5">
                {/* Header: title right, clear icon left */}
                <div className="flex items-center justify-between px-2 py-1">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <button
                          type="button"
                          onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                          onClick={clearRecent}
                          className="flex items-center justify-center h-5 w-5 text-muted-foreground hover:text-destructive transition-colors"
                        />
                      }
                    >
                      <Trash2Icon className="size-3.5" />
                    </TooltipTrigger>
                    <TooltipContent>پاک کردن گذشته</TooltipContent>
                  </Tooltip>
                  <span className="text-[10px] font-bold text-muted-foreground">جستوجوهای قبلی</span>
                </div>
                {filteredRecent.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { setValue(item); goSearch(item) }}
                    className="w-full text-right text-xs px-2 py-1.5 rounded-lg hover:bg-muted transition-colors text-foreground"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <Input
              ref={inputRef}
              placeholder="دنبال چیزی میگردی؟"
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                setRecentOpen(true)
                setCatOpen(false)
              }}
              onFocus={() => {
                setRecentOpen(true)
                setCatOpen(false)
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setRecentOpen(false)
                  setCatOpen(false)
                  e.currentTarget.blur()
                }
              }}
              autoComplete="off"
              spellCheck={false}
              className={cn(
                "!border-0 !bg-transparent !shadow-none focus-visible:ring-0 text-right text-sm h-6 transition-[width] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] px-1",
                expanded ? "w-36" : "w-28"
              )}
            />
          </div>

          {/* Divider — only visible when expanded */}
          <div
            className={cn(
              "h-4 w-px bg-border/50 shrink-0 transition-[opacity] duration-300",
              expanded ? "opacity-100" : "opacity-0"
            )}
          />

          {/* Category button — RIGHT side (in RTL = visually left of divider)
              Appears by expanding width; NO opacity fade so the button just clips in cleanly */}
          <div
            ref={catWrapRef}
            className={cn(
              "relative transition-[width] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden",
              expanded ? "w-24" : "w-0"
            )}
          >
            {/* ── Category drop-up — anchored above the category wrapper ── */}
            <div
              className={cn(
                "absolute bottom-[calc(100%+10px)] right-0 w-28 overflow-hidden rounded-xl shadow-lg transition-all duration-300 ease-out",
                DROPUP_BG,
                catOpen && expanded
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 translate-y-2 pointer-events-none"
              )}
            >
              <div className="p-1">
                {searchModules.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setModule(m.value)
                      setCatOpen(false)
                    }}
                    className={cn(
                      "w-full text-right text-xs px-3 py-1.5 rounded-lg transition-colors",
                      m.value === module
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* The button itself — visible only when expanded (clipped by parent width=0) */}
            <button
              type="button"
              onClick={() => {
                setCatOpen((o) => !o)
                setRecentOpen(false)
              }}
              className="h-6 w-24 text-xs text-right px-2 rounded-full transition-colors whitespace-nowrap overflow-hidden flex items-center justify-between gap-1 text-foreground/80 hover:text-foreground"
            >
              <span className="truncate">{selectedLabel}</span>
              <ChevronDownIcon
                className={`size-3 shrink-0 transition-transform duration-300 ${catOpen ? "-rotate-180" : ""}`}
              />
            </button>
          </div>
        </form>
      </div>
    </TooltipProvider>
  )
}
