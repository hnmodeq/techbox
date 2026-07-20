"use client"

import * as React from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { SearchIcon, HistoryIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
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

const BAR_BG = "bg-background/90 backdrop-blur-md border border-border/80"

export function FloatingSearch() {
  const router   = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [value,      setValue]      = React.useState("")
  const [module,     setModule]     = React.useState<SearchModule>("all")
  const [expanded,   setExpanded]   = React.useState(false)
  const [recentOpen, setRecentOpen] = React.useState(false)
  const [catOpen,    setCatOpen]    = React.useState(false)
  const [recent,     setRecent]     = React.useState<string[]>([])

  const rootRef      = React.useRef<HTMLDivElement>(null)
  const inputRef     = React.useRef<HTMLInputElement>(null)
  const hoverRef     = React.useRef(false)             // true while any hover is active
  const collapseTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync with /search page params
  React.useEffect(() => {
    if (pathname !== "/search") return
    setValue(searchParams.get("q") || "")
    const m = searchParams.get("module")
    setModule(isSearchModule(m) ? m : "all")
  }, [pathname, searchParams])

  // Load recent searches
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
    const params = new URLSearchParams({ q: trimmed })
    if (mod !== "all") params.set("module", mod)
    router.push(`/search?${params.toString()}`)
  }, [module, router, saveSearch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    goSearch(value)
  }

  // ── Hover management ───────────────────────────────────────────────────────
  // We track hover manually so the Select portal (outside rootRef) doesn't
  // trigger a false mouseLeave collapse.

  const scheduleCollapse = React.useCallback(() => {
    if (collapseTimer.current) clearTimeout(collapseTimer.current)
    collapseTimer.current = setTimeout(() => {
      if (!hoverRef.current) {
        setExpanded(false)
        setRecentOpen(false)
        setCatOpen(false)
      }
    }, 1000)
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

  // Close both menus when focus leaves the bar entirely
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

  const query         = value.trim().toLowerCase()
  const filteredRecent = query
    ? recent.filter((r) => r.toLowerCase().includes(query))
    : recent

  const selectedLabel = searchModules.find((m) => m.value === module)?.label || "همه"

  return (
    <div
      ref={rootRef}
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50"
      dir="rtl"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Category drop-up ─────────────────────────────────────────────── */}
      <div
        className={cn(
          "absolute right-0 bottom-[calc(100%+10px)] w-28 overflow-hidden rounded-xl shadow-lg transition-all duration-200",
          BAR_BG,
          catOpen && expanded
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-1 pointer-events-none"
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
                  : "hover:bg-muted"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Recent searches drop-up ──────────────────────────────────────── */}
      <div
        className={cn(
          "absolute bottom-[calc(100%+10px)] overflow-hidden rounded-xl shadow-lg transition-all duration-200",
          BAR_BG,
          // width matches the input — we'll position it above the input area
          "left-28 right-8", // align above input+button area
          recentOpen && filteredRecent.length > 0 && expanded
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-1 pointer-events-none"
        )}
      >
        <div className="p-1.5">
          {/* Header */}
          <div className="flex items-center justify-between px-2 py-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={clearRecent}
              className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
            >
              پاک کردن
            </button>
            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
              <HistoryIcon className="size-3" />
              جست و جو های اخیر شما
            </div>
          </div>
          {filteredRecent.map((item) => (
            <button
              key={item}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { setValue(item); goSearch(item) }}
              className="w-full text-right text-xs px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main pill ────────────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex items-center gap-1 rounded-full shadow-lg px-2.5 py-1.5 transition-all duration-500 ease-out",
          BAR_BG,
          expanded ? "opacity-100" : "opacity-50"
        )}
      >
        {/* Category button — slides in when expanded */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-500",
            expanded ? "w-24 opacity-100" : "w-0 opacity-0 pointer-events-none"
          )}
        >
          <button
            type="button"
            onClick={() => {
              setCatOpen((o) => !o)
              setRecentOpen(false)   // close recent when opening category
            }}
            className="h-6 w-24 text-xs text-right px-2 rounded-full hover:bg-muted/40 transition-colors whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {selectedLabel}
          </button>
        </div>

        {/* Thin divider between category and input */}
        {expanded && (
          <div className="h-4 w-px bg-border/50 shrink-0" />
        )}

        {/* Input */}
        <Input
          ref={inputRef}
          placeholder="دنبال چیزی میگردی؟"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setRecentOpen(true)
            setCatOpen(false)   // close category when typing
          }}
          onFocus={() => {
            setRecentOpen(true)
            setCatOpen(false)   // close category when focusing input
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
            "!border-0 !bg-transparent !shadow-none focus-visible:ring-0 text-right text-sm h-6 transition-all duration-500 px-1",
            expanded ? "w-36" : "w-28"
          )}
        />

        {/* Search icon */}
        <button
          type="submit"
          aria-label="جستجو"
          className="flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <SearchIcon className="size-3.5" />
        </button>
      </form>
    </div>
  )
}
