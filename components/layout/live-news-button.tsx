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
      title={hasUnread ? "خبر خوانده‌نشده دارید" : "خبر جدیدی ندارید"}
      className="fixed left-4 top-20 z-40 flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white shadow-lg transition-all hover:bg-red-700 hover:shadow-xl active:scale-95"
    >
      {hasUnread && <span className="h-2 w-2 rounded-full bg-white" />}
      <NewspaperIcon className="size-3.5" />
      <span className="hidden sm:inline">اخبار زنده</span>
    </button>
  )
}
