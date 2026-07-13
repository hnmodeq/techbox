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

type ActivityGroup = {
  key: string
  module: string
  slug: string
  title: string
  image?: string | null
  hasLike: boolean
  likedAt?: string
  comments: Array<{ id: string; text: string; createdAt: string }>
  createdAt: string
}

const moduleLabels: Record<string, string> = {
  blog: "مقاله",
  review: "نقد و بررسی",
  media: "ویدیو",
  forum: "تاپیک انجمن",
  news: "خبر",
}

function relativeTime(input: string) {
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return "زمان نامشخص"
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
  if (seconds < 60) return `${seconds.toLocaleString("fa-IR")} ثانیه پیش`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes.toLocaleString("fa-IR")} دقیقه پیش`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours.toLocaleString("fa-IR")} ساعت پیش`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days.toLocaleString("fa-IR")} روز پیش`
  const months = Math.floor(days / 30.4375)
  if (months < 12) return `${months.toLocaleString("fa-IR")} ماه پیش`
  const years = Math.floor(days / 365.2425)
  return `${years.toLocaleString("fa-IR")} سال پیش`
}

function groupActivities(activities: UserActivity[]) {
  const map = new Map<string, ActivityGroup>()

  for (const activity of activities) {
    const key = `${activity.module}:${activity.slug}`
    const current = map.get(key) || {
      key,
      module: activity.module,
      slug: activity.slug,
      title: activity.title,
      image: activity.image,
      hasLike: false,
      comments: [],
      createdAt: activity.createdAt,
    }

    if (activity.type === "like") {
      current.hasLike = true
      current.likedAt = activity.createdAt
    } else {
      current.comments.push({
        id: activity.id,
        text: activity.text || "دیدگاه بدون متن",
        createdAt: activity.createdAt,
      })
    }

    current.createdAt = [...current.comments.map((comment) => comment.createdAt), current.likedAt].filter(Boolean).sort((a, b) => +new Date(b!) - +new Date(a!))[0] || activity.createdAt
    map.set(key, current)
  }

  return Array.from(map.values()).map((group) => ({
    ...group,
    comments: [...group.comments].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
  }))
}

function activitySentence(group: ActivityGroup) {
  const latestComment = group.comments[0]
  if (group.hasLike && latestComment) {
    return (
      <>
        <span className="text-foreground">این کاربر این محتوا را پسندیده و گفته است:</span>{" "}
        <span className="text-muted-foreground">{latestComment.text}</span>
        {group.comments.length > 1 && <span className="text-muted-foreground"> ({(group.comments.length - 1).toLocaleString("fa-IR")} دیدگاه دیگر)</span>}
      </>
    )
  }
  if (latestComment) return <span className="text-muted-foreground">{latestComment.text}</span>
  return <span className="text-muted-foreground">این کاربر این محتوا را پسندیده است.</span>
}

export function UserActivityList({ activities }: { activities: UserActivity[] }) {
  const [filter, setFilter] = React.useState<"all" | "like" | "comment">("all")
  const [page, setPage] = React.useState(1)
  const pageSize = 10

  const grouped = React.useMemo(() => groupActivities(activities), [activities])
  const filtered = React.useMemo(() => {
    const items = grouped.filter((group) => {
      if (filter === "like") return group.hasLike
      if (filter === "comment") return group.comments.length > 0
      return true
    })
    return [...items].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  }, [grouped, filter])

  React.useEffect(() => setPage(1), [filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <section className="mt-10 space-y-4">
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
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">برای این بخش هنوز فعالیتی ثبت نشده است.</CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {pageItems.map((group) => {
            const latestComment = group.comments[0]
            const timeBasis = latestComment?.createdAt || group.likedAt || group.createdAt
            return (
              <Link key={group.key} href={`/${group.module}/${group.slug}`} className="block">
                <Card className="p-0 transition-colors hover:bg-muted/40">
                  <CardContent className="grid min-h-24 grid-cols-[82px_minmax(92px,0.38fr)_minmax(0,1fr)] gap-3 p-3 max-sm:grid-cols-[76px_minmax(0,1fr)]">
                    <div className="relative row-span-2 overflow-hidden rounded-lg bg-muted">
                      {group.image ? (
                        <Image src={group.image} alt={group.title} fill sizes="82px" className="object-cover" {...blurProps(group.image)} />
                      ) : (
                        <div className="flex h-full min-h-20 w-full items-center justify-center text-muted-foreground">
                          {group.comments.length > 0 ? <MessageCircleIcon className="size-6" /> : <HeartIcon className="size-6" />}
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-col justify-center gap-1 max-sm:col-start-2">
                      <Badge variant="outline" className="w-fit">{moduleLabels[group.module] || group.module}</Badge>
                      <span className="text-xs text-muted-foreground">{relativeTime(timeBasis)}</span>
                    </div>

                    <div className="flex min-w-0 items-center text-sm leading-7 max-sm:col-span-2 max-sm:col-start-1">
                      <p className="line-clamp-2">{activitySentence(group)}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="pt-3">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
              <PaginationItem key={item}>
                <PaginationLink isActive={page === item} onClick={() => setPage(item)}>
                  {item.toLocaleString("fa-IR")}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </section>
  )
}
