"use client"

import * as React from "react"
import { NewspaperIcon } from "lucide-react"

type LiveNewsButtonProps = {
  hasUnread?: boolean
  onClick: () => void
}

export function LiveNewsButton({ hasUnread = false, onClick }: LiveNewsButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="اخبار زنده تکباکس"
      title="اخبار زنده تکباکس"
      className="relative flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:bg-red-700 hover:shadow-lg active:scale-95"
    >
      {/* Pulse animation dot */}
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
      </span>
      <NewspaperIcon className="size-3.5" />
      <span className="hidden sm:inline">اخبار زنده</span>
      {hasUnread && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex h-3 w-3 rounded-full bg-white ring-2 ring-red-600"></span>
        </span>
      )}
    </button>
  )
}
