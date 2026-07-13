"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { SidebarInput } from "@/components/ui/sidebar"
import { SearchIcon, HistoryIcon } from "lucide-react"

const RECENT_SEARCHES_KEY = "techbox-recent-searches"

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  const router = useRouter()
  const [value, setValue] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [recent, setRecent] = React.useState<string[]>([])

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
    (query: string) => {
      const q = query.trim()
      if (!q) return
      saveSearch(q)
      setOpen(false)
      router.push(`/search?q=${encodeURIComponent(q)}`)
    },
    [router, saveSearch]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    goSearch(value)
  }

  return (
    <form onSubmit={handleSubmit} {...props}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <div className="relative">
              <Label htmlFor="search" className="sr-only">
                جستجو
              </Label>
              <SidebarInput
                id="search"
                placeholder="جستجو در تکباکس..."
                className="h-8 ps-7"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onFocus={() => setOpen(true)}
              />
              <SearchIcon className="pointer-events-none absolute top-1/2 start-2 size-4 -translate-y-1/2 opacity-50 select-none" />
            </div>
          }
        />
        <PopoverContent className="w-[min(28rem,calc(100vw-2rem))] p-2" align="center">
          <div className="space-y-2" dir="rtl">
            <div className="flex items-center gap-2 px-2 text-xs font-bold text-muted-foreground">
              <HistoryIcon className="size-3.5" />
              جستجوهای اخیر
            </div>
            {recent.length > 0 ? (
              <div className="space-y-1">
                {recent.map((item) => (
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
        </PopoverContent>
      </Popover>
    </form>
  )
}
