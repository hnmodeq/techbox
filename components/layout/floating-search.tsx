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
  const [dropupOpen, setDropupOpen] = React.useState(false)
  const [recent, setRecent] = React.useState<string[]>([])
  const rootRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Sync with /search params
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

  // Close on outside click
  React.useEffect(() => {
    if (!dropupOpen) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setDropupOpen(false)
    }
    document.addEventListener("pointerdown", onDown)
    return () => document.removeEventListener("pointerdown", onDown)
  }, [dropupOpen])

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
    setDropupOpen(false)
    const params = new URLSearchParams({ q: trimmed })
    if (mod !== "all") params.set("module", mod)
    router.push(`/search?${params.toString()}`)
  }, [module, router, saveSearch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    goSearch(value)
  }

  const query = value.trim().toLowerCase()
  const filteredRecent = query
    ? recent.filter((r) => r.toLowerCase().includes(query))
    : recent

  const selectedLabel = searchModules.find((m) => m.value === module)?.label || "همه"

  return (
    <div
      ref={rootRef}
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50"
      dir="rtl"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => {
        setExpanded(false)
        setDropupOpen(false)
      }}
    >
      {/* Drop-up recent searches — appears above the bar */}
      {dropupOpen && filteredRecent.length > 0 && (
        <div className="absolute bottom-full mb-2 right-0 left-0 rounded-xl border border-border bg-popover shadow-xl p-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-1.5 px-2 pb-1.5 text-xs font-bold text-muted-foreground">
            <HistoryIcon className="size-3" />
            جستجوهای اخیر شما
          </div>
          {filteredRecent.map((item) => (
            <button
              key={item}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { setValue(item); goSearch(item) }}
              className="w-full text-right text-xs px-3 py-2 rounded-lg hover:bg-muted transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {/* Floating bar */}
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex items-center gap-2 rounded-full border border-border bg-background/90 backdrop-blur-md shadow-xl px-3 py-2 transition-all duration-300 ease-out",
          expanded ? "gap-2" : "gap-1.5"
        )}
      >
        {/* Category selector — only when expanded */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            expanded ? "w-28 opacity-100" : "w-0 opacity-0 pointer-events-none"
          )}
        >
          <Select value={module} onValueChange={(v) => isSearchModule(v) && setModule(v)}>
            <SelectTrigger
              size="sm"
              aria-label="محدوده جستجو"
              className="h-7 w-28 border-border bg-muted/40 px-2 rounded-full text-xs"
            >
              <span className="truncate">{selectedLabel}</span>
            </SelectTrigger>
            <SelectContent align="center" className="min-w-36">
              {searchModules.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Input */}
        <Input
          ref={inputRef}
          placeholder="دنبال چی میگردی؟"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setDropupOpen(true)
          }}
          onFocus={() => setDropupOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") { setDropupOpen(false); e.currentTarget.blur() }
          }}
          autoComplete="off"
          spellCheck={false}
          className={cn(
            "border-0 bg-transparent shadow-none focus-visible:ring-0 text-right text-sm transition-all duration-300 h-7",
            expanded ? "w-52" : "w-36"
          )}
        />

        {/* Search button */}
        <button
          type="submit"
          aria-label="جستجو"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
        >
          <SearchIcon className="size-3.5" />
        </button>
      </form>
    </div>
  )
}
