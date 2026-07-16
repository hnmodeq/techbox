"use client"

import * as React from "react"
import { BookmarkIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function SaveButton({ module, slug }: { module: string; slug: string }) {
  const [saved, setSaved] = React.useState(false)
  const [busy, setBusy] = React.useState(false)

  React.useEffect(() => {
    fetch(`/api/saved-content?module=${encodeURIComponent(module)}&slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setSaved(Boolean(data?.saved)))
      .catch(() => {})
  }, [module, slug])

  const toggle = async () => {
    if (busy) return
    setBusy(true)
    const res = await fetch("/api/saved-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module, slug }),
    })
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent("tb_open_auth"))
      setBusy(false)
      return
    }
    const data = await res.json().catch(() => ({}))
    setSaved(Boolean(data.saved))
    toast.success(data.saved ? "محتوا ذخیره شد" : "محتوا از ذخیره‌ها حذف شد")
    setBusy(false)
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
