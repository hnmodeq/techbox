"use client"

import * as React from "react"
import { Share2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function ShareButton({ url, label = "اشتراک‌گذاری", className }: { url?: string; label?: string; className?: string }) {
  const copy = async () => {
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "")
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success("لینک اشتراک‌گذاری کپی شد")
    } catch {
      const input = document.createElement("input")
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      document.body.removeChild(input)
      toast.success("لینک اشتراک‌گذاری کپی شد")
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<Button type="button" variant="ghost" size="sm" className={className} onClick={copy} />}>
        <Share2Icon className="size-4" />
        {label}
      </TooltipTrigger>
      <TooltipContent>به اشتراک گذاشتن لینک</TooltipContent>
    </Tooltip>
  )
}
