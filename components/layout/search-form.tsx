"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { SearchIcon, HistoryIcon } from "lucide-react"
import type { ModuleSlug } from "@/lib/content"

const RECENT_SEARCHES_KEY = "techbox-recent-searches"

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
  return Boolean(value && searchModules.some((module) => module.value === value))
}

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const rootRef = React.useRef<HTMLFormElement | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const [value, setValue] = React.useState("")
  const [module, setModule] = React.useState<SearchModule>("all")
  const [open, setOpen] = React.useState(false)
  const [recent, setRecent] = React.useState<string[]>([])

  const query = value.trim().toLowerCase()
  const filteredRecent = React.useMemo(
    () => (query ? recent.filter((item) => item.toLowerCase().includes(query)) : recent),
    [query, recent]
  )
  const selectedModuleLabel = React.useMemo(
    () => searchModules.find((item) => item.value === module)?.label || "همه",
    [module]
  )

  React.useEffect(() => {
    if (pathname !== "/search") return
    setValue(searchParams.get("q") || "")
    const nextModule = searchParams.get("module")
    setModule(isSearchModule(nextModule) ? nextModule : "all")
  }, [pathname, searchParams])

  // Close dropdown on outside click
  React.useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open])

  React.useEffect(() => {
    const closeSearch = () => setOpen(false)
    window.addEventListener("tb_auth_changed", closeSearch)
    return () => window.removeEventListener("tb_auth_changed", closeSearch)
  }, [])

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (stored) setRecent(JSON.parse(stored))
    } catch {}
  }, [])

  const saveSearch = React.useCallback((q: string) => {
    setRecent((current) => {
      const next = [q, ...current.filter((item) => item !== q)].slice(0, 6)
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  const goSearch = React.useCallback(
    (searchQuery: string, selectedModule: SearchModule = module) => {
      const q = searchQuery.trim()
      if (!q) return
      saveSearch(q)
      setOpen(false)
      const params = new URLSearchParams({ q })
      if (selectedModule !== "all") params.set("module", selectedModule)
      router.push(`/search?${params.toString()}`)
    },
    [module, router, saveSearch]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    goSearch(value)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value
    setValue(nextValue)
    const nextQuery = nextValue.trim().toLowerCase()
    if (!nextQuery || recent.some((item) => item.toLowerCase().includes(nextQuery))) {
      setOpen(true)
    }
  }

  const handleInputFocus = () => {
    setOpen(true)
  }

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false)
      event.currentTarget.blur()
    }
  }

  return (
    <form ref={rootRef} onSubmit={handleSubmit} {...props} autoComplete="off">
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          جستجو
        </Label>
        <div className="absolute top-1/2 end-1 z-10 -translate-y-1/2 flex items-center gap-0.5">
          <Select
            value={module}
            onValueChange={(nextValue) => {
              if (isSearchModule(nextValue)) setModule(nextValue)
            }}
          >
            <SelectTrigger
              size="sm"
              aria-label="محدوده جستجو"
              className="h-6 max-w-[6.5rem] border-transparent bg-background/70 px-1.5 shadow-none hover:bg-muted"
            >
              <span className="truncate">{selectedModuleLabel}</span>
            </SelectTrigger>
            <SelectContent align="end" className="min-w-36">
              {searchModules.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="submit"
            aria-label="جستجو"
            className="flex size-6 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
          >
            <SearchIcon className="size-4" />
          </button>
        </div>
        <Input
          id="search"
          ref={inputRef}
          data-slot="sidebar-input"
          data-sidebar="input"
          placeholder="دنبال چی میگردی؟"
          className="h-8 ps-3 pe-[7.25rem] text-right border-input bg-muted/20 dark:bg-muted/30"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleInputKeyDown}
        />
      </div>

      {/* Recent searches dropdown */}
      {open && (
        <div className="absolute start-0 z-50 mt-1 w-full rounded-md border bg-popover p-2 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
          <div className="space-y-2" dir="rtl">
            <div className="flex items-center gap-2 px-2 text-xs font-bold text-muted-foreground">
              <HistoryIcon className="size-3.5" />
              جستجوهای اخیر شما
            </div>
            {recent.length > 0 ? (
              <div className="space-y-1">
                {filteredRecent.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="flex w-full items-center rounded-md px-2 py-2 text-start text-xs transition-colors hover:bg-muted"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setValue(item)
                      goSearch(item)
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-md bg-muted/50 px-2 py-3 text-center text-xs text-muted-foreground">
                هنوز جستجوی اخیری ندارید.
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  )
}
