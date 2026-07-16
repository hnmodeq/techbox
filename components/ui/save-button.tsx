"use client"

import * as React from "react"
import { BookmarkIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

// ─── Saved-state cache (localStorage) ─────────────────────────
// Persists saved state across page loads so the bookmark appears filled
// instantly without waiting for /api/saved-content to respond.
const SAVED_CACHE_KEY = "tb_saved"

function getSavedCache(): Record<string, boolean> {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(localStorage.getItem(SAVED_CACHE_KEY) || "{}")
  } catch {
    return {}
  }
}

function setSavedCache(module: string, slug: string, saved: boolean) {
  if (typeof window === "undefined") return
  try {
    const cache = getSavedCache()
    const key = `${module}:${slug}`
    if (saved) {
      cache[key] = true
    } else {
      delete cache[key]
    }
    localStorage.setItem(SAVED_CACHE_KEY, JSON.stringify(cache))
  } catch {
    // localStorage might be full or disabled
  }
}

function getCachedSaved(module: string, slug: string): boolean | undefined {
  const cache = getSavedCache()
  return cache[`${module}:${slug}`]
}

export function SaveButton({ module, slug }: { module: string; slug: string }) {
  // Read saved from localStorage cache synchronously for instant render
  const cachedSaved = getCachedSaved(module, slug)
  const [saved, setSaved] = React.useState(cachedSaved ?? false)
  const [busy, setBusy] = React.useState(false)

  // Confirm with server
  React.useEffect(() => {
    fetch(`/api/saved-content?module=${encodeURIComponent(module)}&slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const isSaved = Boolean(data?.saved)
        setSaved(isSaved)
        setSavedCache(module, slug, isSaved)
      })
      .catch(() => {})
  }, [module, slug])

  const toggle = async () => {
    if (busy) return
    setBusy(true)

    // Optimistic: toggle immediately
    const prevSaved = saved
    const nextSaved = !saved
    setSaved(nextSaved)
    setSavedCache(module, slug, nextSaved)

    try {
      const res = await fetch("/api/saved-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module, slug }),
      })
      if (res.status === 401) {
        // Revert — not logged in
        setSaved(prevSaved)
        setSavedCache(module, slug, prevSaved)
        window.dispatchEvent(new CustomEvent("tb_open_auth"))
        setBusy(false)
        return
      }
      const data = await res.json().catch(() => ({}))
      const serverSaved = Boolean(data.saved)
      setSaved(serverSaved)
      setSavedCache(module, slug, serverSaved)
      toast.success(serverSaved ? "محتوا ذخیره شد" : "محتوا از ذخیره‌ها حذف شد")
    } catch {
      // Revert on network error
      setSaved(prevSaved)
      setSavedCache(module, slug, prevSaved)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<Button type="button" variant="ghost" size="sm" onClick={toggle} disabled={busy} />}>
        <BookmarkIcon className={saved ? "size-4 fill-current" : "size-4"} />
        {saved ? "ذخیره‌شده" : "ذخیره"}
      </TooltipTrigger>
      <TooltipContent>{saved ? "حذف از ذخیره‌ها" : "ذخیره کردن این ویدیو"}</TooltipContent>
    </Tooltip>
  )
}
