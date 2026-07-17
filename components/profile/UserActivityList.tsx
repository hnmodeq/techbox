"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { HeartIcon, MessageCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { blurProps } from "@/lib/image-placeholder"
import { formatRelativeTime } from "@/lib/date-format"

export type UserActivity = {
  id: string
  type: "like" | "comment"
  module: string
  slug: string
  title: string
  image?: string | null
  excerpt?: string | null
  text?: string | null
  createdAt: string
}

type ActivityRow = {
  key: string
  type: "like" | "comment"
  module: string
  slug: string
  title: string
  image?: string | null
  text?: string | null
  createdAt: string
}

const moduleLabels: Record<string, string> = {
  blog: "مقاله",
  review: "نقد و بررسی",
  media: "ویدیو",
  forum: "تاپیک انجمن",
  news: "خبر",
}

function toRows(activities: UserActivity[]) {
  const grouped = new Map<string, { like?: UserActivity; comments: UserActivity[] }>()
  for (const activity of activities) {
    const key = `${activity.module}:${activity.slug}`
    const group = grouped.get(key) || { comments: [] }
    if (activity.type === "comment") group.comments.push(activity)
    else group.like = activity
    grouped.set(key, group)
  }

  const rows: ActivityRow[] = []
  for (const [key, group] of grouped) {
    if (group.comments.length > 0) {
      const latestComment = [...group.comments].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0]
      rows.push({
        key,
        type: "comment",
        module: latestComment.module,
        slug: latestComment.slug,
        title: latestComment.title,
        image: latestComment.image,
        text: latestComment.text,
        createdAt: latestComment.createdAt,
      })
    } else if (group.like) {
      rows.push({
        key,
        type: "like",
        module: group.like.module,
        slug: group.like.slug,
        title: group.like.title,
        image: group.like.image,
        createdAt: group.like.createdAt,
      })
    }
  }
  return rows.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
}

export function UserActivityList({ activities, className = "" }: { activities: UserActivity[]; className?: string }) {
  const [filter, setFilter] = React.useState<"all" | "like" | "comment">("all")
  const [page, setPage] = React.useState(1)
  const pageSize = 10

  const rows = React.useMemo(() => toRows(activities), [activities])
  const filtered = React.useMemo(() => rows.filter((row) => filter === "all" || row.type === filter), [rows, filter])

  React.useEffect(() => setPage(1), [filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <section className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div>
          <h2 className="text-xl font-black text-foreground">فعالیت‌های کاربر</h2>
          <p className="mt-1 text-xs text-muted-foreground">پسندها و دیدگاه‌های واقعی ثبت‌شده در دیتابیس</p>
        </div>
        <div className="flex rounded-lg border bg-muted/30 p-1">
          {[
            ["all", "همه"],
            ["like", "پسندها"],
            ["comment", "دیدگاه‌ها"],
          ].map(([value, label]) => (
            <Button key={value} type="button" variant={filter === value ? "secondary" : "ghost"} size="sm" onClick={() => setFilter(value as typeof filter)}>
              {label}
            </Button>
          ))}
        </div>
      </div>

      {pageItems.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">برای این بخش هنوز فعالیتی ثبت نشده است.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {pageItems.map((row) => (
            <Link key={row.key} href={`/${row.module}/${row.slug}`} className="block">
              <Card className="p-0 transition-colors hover:bg-muted/40">
                <CardContent className="grid min-h-[76px] grid-cols-[76px_minmax(0,1fr)] gap-3 p-2.5 sm:grid-cols-[84px_minmax(0,1fr)]">
                  <div className="relative row-span-2 overflow-hidden rounded-lg bg-muted">
                    {row.image ? (
                      <Image src={row.image} alt={row.title} fill sizes="84px" className="object-cover" {...blurProps(row.image)} />
                    ) : (
                      <div className="flex h-full min-h-[72px] w-full items-center justify-center text-muted-foreground">
                        {row.type === "comment" ? <MessageCircleIcon className="size-5" /> : <HeartIcon className="size-5" />}
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 items-center gap-2">
                    <Badge variant="outline" className="shrink-0">{moduleLabels[row.module] || row.module}</Badge>
                    <span className="truncate text-xs text-muted-foreground">{formatRelativeTime(row.createdAt)}</span>
                  </div>
                  <p className="line-clamp-2 min-w-0 text-sm leading-6 text-muted-foreground">
                    {row.type === "comment" ? row.text || "دیدگاه بدون متن" : "این کاربر این محتوا را پسندیده است."}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="pt-3">
          <PaginationContent>
            <PaginationItem><PaginationPrevious disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} /></PaginationItem>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
              <PaginationItem key={item}><PaginationLink isActive={page === item} onClick={() => setPage(item)}>{item.toLocaleString("fa-IR")}</PaginationLink></PaginationItem>
            ))}
            <PaginationItem><PaginationNext disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} /></PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </section>
  )
}
