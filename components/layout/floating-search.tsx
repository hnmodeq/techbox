"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChevronDownIcon, SearchIcon, Trash2Icon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
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

function isSearchModule(value: string | null): value is SearchModule {
  return Boolean(value && searchModules.some((item) => item.value === value))
}

/** Header search: compact magnifier until clicked, then a complete field with
 * category and recent-search menus. This replaces the old bottom island. */
export function HeaderSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const [expanded, setExpanded] = React.useState(false)
  const [value, setValue] = React.useState("")
  const [module, setModule] = React.useState<SearchModule>("all")
  const [menu, setMenu] = React.useState<"recent" | "category" | null>(null)
  const [recent, setRecent] = React.useState<string[]>([])

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY)
      if (stored) setRecent(JSON.parse(stored))
    } catch {}
  }, [])

  React.useEffect(() => {
    if (pathname !== "/search") return
    setValue(searchParams.get("q") || "")
    const selected = searchParams.get("module")
    setModule(isSearchModule(selected) ? selected : "all")
  }, [pathname, searchParams])

  React.useEffect(() => {
    const close = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return
      setExpanded(false)
      setMenu(null)
    }
    document.addEventListener("pointerdown", close)
    return () => document.removeEventListener("pointerdown", close)
  }, [])

  const saveSearch = React.useCallback((query: string) => {
    setRecent((current) => {
      const next = [query, ...current.filter((item) => item !== query)].slice(0, 8)
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const goSearch = React.useCallback((query: string, targetModule: SearchModule = module) => {
    const trimmed = query.trim()
    if (!trimmed) return
    saveSearch(trimmed)
    const params = new URLSearchParams({ q: trimmed })
    if (targetModule !== "all") params.set("module", targetModule)
    setMenu(null)
    setExpanded(false)
    router.push(`/search?${params.toString()}`)
  }, [module, router, saveSearch])

  const expand = () => {
    setExpanded(true)
    setMenu("recent")
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!expanded) {
      expand()
      return
    }
    if (value.trim()) goSearch(value)
    else inputRef.current?.focus()
  }

  const clearRecent = () => {
    setRecent([])
    try { localStorage.removeItem(RECENT_KEY) } catch {}
  }

  const selectedLabel = searchModules.find((item) => item.value === module)?.label || "همه"
  const query = value.trim().toLowerCase()
  const filteredRecent = query
    ? recent.filter((item) => item.toLowerCase().includes(query))
    : recent

  return (
    <div ref={rootRef} className="relative shrink-0" dir="rtl">
      <form
        role="search"
        onSubmit={submit}
        className={cn(
          "flex h-8 items-center overflow-hidden rounded-md transition-[width,border-color,background-color] duration-200",
          expanded ? "w-[min(25rem,60vw)] border border-border bg-background" : "w-8 border border-transparent bg-transparent",
        )}
      >
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="submit"
                aria-label={expanded ? "اجرای جستجو" : "باز کردن جستجو"}
                className="inline-flex size-8 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            }
          >
            <SearchIcon className="size-4" />
          </TooltipTrigger>
          <TooltipContent>{expanded ? "جستجو" : "باز کردن جستجو"}</TooltipContent>
        </Tooltip>

        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            setMenu("recent")
          }}
          onFocus={() => setMenu("recent")}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setMenu(null)
              setExpanded(false)
              event.currentTarget.blur()
            }
          }}
          placeholder="جستجو در تکباکس…"
          autoComplete="off"
          className={cn(
            "h-full min-w-0 flex-1 bg-transparent px-1 text-sm text-foreground outline-none placeholder:text-muted-foreground",
            !expanded && "invisible",
          )}
        />

        <button
          type="button"
          onClick={() => setMenu((current) => current === "category" ? null : "category")}
          className={cn(
            "flex h-6 w-24 shrink-0 items-center justify-between gap-1 border-s border-border px-2 text-xs text-muted-foreground transition-colors hover:text-foreground",
            !expanded && "hidden",
          )}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDownIcon className={cn("size-3 transition-transform", menu === "category" && "rotate-180")} />
        </button>
      </form>

      {expanded && menu === "recent" && (
        <div className="absolute top-[calc(100%+0.5rem)] start-0 z-[70] w-full min-w-64 overflow-hidden rounded-md border border-border bg-popover p-1.5 text-popover-foreground shadow-lg">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-[11px] font-bold text-muted-foreground">جستجوهای اخیر</span>
            {recent.length > 0 && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button type="button" onClick={clearRecent} className="text-muted-foreground hover:text-destructive" aria-label="پاک کردن جستجوهای اخیر" />
                  }
                >
                  <Trash2Icon className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent>پاک کردن جستجوهای اخیر</TooltipContent>
              </Tooltip>
            )}
          </div>
          {filteredRecent.length > 0 ? filteredRecent.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => { setValue(item); goSearch(item) }}
              className="block w-full rounded-sm px-2 py-1.5 text-right text-xs transition-colors hover:bg-muted"
            >
              {item}
            </button>
          )) : (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">جستجوی اخیری ثبت نشده است.</p>
          )}
        </div>
      )}

      {expanded && menu === "category" && (
        <div className="absolute top-[calc(100%+0.5rem)] end-0 z-[70] w-36 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg">
          {searchModules.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setModule(item.value)
                setMenu(null)
                inputRef.current?.focus()
              }}
              className={cn(
                "block w-full rounded-sm px-2 py-1.5 text-right text-xs transition-colors hover:bg-muted",
                item.value === module && "font-bold text-primary",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Compatibility export for older imports while the visual is no longer floating. */
export const FloatingSearch = HeaderSearch
