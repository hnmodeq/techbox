"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Label } from "@/components/ui/label"
import { SidebarInput } from "@/components/ui/sidebar"
import { SearchIcon } from "lucide-react"

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  const router = useRouter()
  const [value, setValue] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = value.trim()
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} {...props}>
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
        />
        <SearchIcon className="pointer-events-none absolute top-1/2 start-2 size-4 -translate-y-1/2 opacity-50 select-none" />
      </div>
    </form>
  )
}
