"use client"

import * as React from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { SearchIcon, HistoryIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { ModuleSlug } from "@/lib/content"

const RECENT_KEY = "techbox-recent-searches"

type SearchModule = "all" | Extract<ModuleSlug, "news" | "blog" | "media" | "shop" | "forum" | "review" | "download">

const searchModules: Array<{ value: SearchModule; label: string }> = [
  { value: "all", label: "همه" },
  { value: "news", label: "اخبار" },
  { value: "blog", label: "مجله" },
  { value: "media", label: "ویدیوهای کوتاه" },
  { value: "shop", label: "فروشگاه" },
  { value: "forum", label: "انجمن" },
  { value: "review", label: "نقد و بررسی" },
  { value: "download", label: "دانلود" },
]

function isSearchModule(v: string | null): v is SearchModule {
  return Boolean(v && searchModules.some((m) => m.value === v))
}

export function FloatingSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [value, setValue] = React.useState("")
  const [module, setModule] = React.useState<SearchModule>("all")
  const [expanded, setExpanded] = React.useState(false)
  const [recentOpen, setRecentOpen] = React.useState(false)
  const [recent, setRecent] = React.useState<string[]>([])

  const rootRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  // Timer ref for the 1-second collapse delay
  const collapseTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    if (pathname !== "/search") return
    setValue(searchParams.get("q") || "")
    const m = searchParams.get("module")
    setModule(isSearchModule(m) ? m : "all")
  }, [pathname, searchParams])

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY)
      if (stored) setRecent(JSON.parse(stored))
    } catch {}
  }, [])

  // Close on outside click
  React.useEffect(() => {
    if (!recentOpen) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setRecentOpen(false)
    }
    document.addEventListener("pointerdown", onDown)
    return () => document.removeEventListener("pointerdown", onDown)
  }, [recentOpen])

  const saveSearch = React.useCallback((q: string) => {
    setRecent((prev) => {
      const next = [q, ...prev.filter((i) => i !== q)].slice(0, 6)
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const goSearch = React.useCallback((q: string, mod: SearchModule = module) => {
    const trimmed = q.trim()
    if (!trimmed) return
    saveSearch(trimmed)
    setRecentOpen(false)
    const params = new URLSearchParams({ q: trimmed })
    if (mod !== "all") params.set("module", mod)
    router.push(`/search?${params.toString()}`)
  }, [module, router, saveSearch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    goSearch(value)
  }

  const handleMouseEnter = () => {
    if (collapseTimer.current) clearTimeout(collapseTimer.current)
    setExpanded(true)
  }

  const handleMouseLeave = () => {
    // 1-second delay before collapsing
    collapseTimer.current = setTimeout(() => {
      setExpanded(false)
      setRecentOpen(false)
    }, 1000)
  }

  const query = value.trim().toLowerCase()
  const filteredRecent = query
    ? recent.filter((r) => r.toLowerCase().includes(query))
    : recent

  const selectedLabel = searchModules.find((m) => m.value === module)?.label || "همه"

  return (
    <div
      ref={rootRef}
      className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50"
      dir="rtl"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex items-center gap-1.5 rounded-full border border-border/60 backdrop-blur-md shadow-lg px-3 py-2 transition-all duration-500 ease-out",
          expanded
            ? "bg-background/90 border-border/80 opacity-100"
            : "bg-background/40 border-border/30 opacity-60"
        )}
      >
        {/* Category selector with its own drop-up */}
        <div
          className={cn(
            "relative overflow-visible transition-all duration-500",
            expanded ? "w-28 opacity-100" : "w-0 opacity-0 pointer-events-none"
          )}
        >
          <Select value={module} onValueChange={(v) => isSearchModule(v) && setModule(v)}>
            <SelectTrigger
              size="sm"
              aria-label="محدوده جستجو"
              className="h-7 w-28 border-0 bg-transparent shadow-none px-2 rounded-full text-xs"
            >
              <span className="truncate">{selectedLabel}</span>
            </SelectTrigger>
            {/* drop-up: use side="top" equivalent — SelectContent will use align+side */}
            <SelectContent
              side="top"
              align="start"
              sideOffset={6}
              className="min-w-[7rem] animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
            >
              {searchModules.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Input with drop-up recent searches above it */}
        <div className="relative">
          {/* Drop-up recent searches — above the input, same width */}
          <div
            className={cn(
              "absolute bottom-full mb-2 right-0 left-0 overflow-hidden transition-all duration-200",
              recentOpen && filteredRecent.length > 0
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 translate-y-1 pointer-events-none"
            )}
          >
            <div className="rounded-xl p-1.5">
              <div className="flex items-center gap-1 px-2 pb-1 text-[10px] font-bold text-muted-foreground">
                <HistoryIcon className="size-3" />
                اخیر
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

          <Input
            ref={inputRef}
            placeholder="دنبال چی میگردی؟"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              if (e.target.value.trim()) setRecentOpen(true)
            }}
            onFocus={() => setRecentOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") { setRecentOpen(false); e.currentTarget.blur() }
            }}
            autoComplete="off"
            spellCheck={false}
            className={cn(
              "border-0 bg-transparent shadow-none focus-visible:ring-0 text-right text-sm h-7 transition-all duration-500",
              expanded ? "w-48" : "w-32"
            )}
          />
        </div>

        {/* Search button — no background */}
        <button
          type="submit"
          aria-label="جستجو"
          className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <SearchIcon className="size-4" />
        </button>
      </form>
    </div>
  )
}
