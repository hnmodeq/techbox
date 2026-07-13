"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { MessageCircleIcon, HeartIcon } from "lucide-react"

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

export function UserActivityList({ activities }: { activities: UserActivity[] }) {
  const [filter, setFilter] = React.useState<"all" | "like" | "comment">("all")
  const [page, setPage] = React.useState(1)
  const pageSize = 8

  const filtered = React.useMemo(() => {
    const items = filter === "all" ? activities : activities.filter((activity) => activity.type === filter)
    return [...items].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  }, [activities, filter])

  React.useEffect(() => setPage(1), [filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <section className="mt-10 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div>
          <h2 className="text-xl font-black text-foreground">فعالیت‌های کاربر</h2>
          <p className="mt-1 text-xs text-muted-foreground">پسندها و دیدگاه‌های ثبت‌شده روی محتواهای تکباکس</p>
        </div>
        <div className="flex rounded-lg border bg-muted/30 p-1">
          {[
            ["all", "همه"],
            ["like", "پسندها"],
            ["comment", "دیدگاه‌ها"],
          ].map(([value, label]) => (
            <Button
              key={value}
              type="button"
              variant={filter === value ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter(value as typeof filter)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {pageItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            برای این بخش هنوز فعالیتی ثبت نشده است.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pageItems.map((activity) => (
            <Link key={activity.id} href={`/${activity.module}/${activity.slug}`} className="block">
              <Card className="p-0 transition-colors hover:bg-muted/40">
                <CardContent className="grid gap-4 p-3 sm:grid-cols-[112px_minmax(0,1fr)] sm:p-4">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-muted sm:aspect-square">
                    {activity.image ? (
                      <Image src={activity.image} alt={activity.title} fill sizes="112px" className="object-cover" {...blurProps(activity.image)} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        {activity.type === "like" ? <HeartIcon className="size-7" /> : <MessageCircleIcon className="size-7" />}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={activity.type === "like" ? "destructive" : "secondary"}>
                        {activity.type === "like" ? "پسند" : "دیدگاه"}
                      </Badge>
                      <Badge variant="outline">{moduleLabels[activity.module] || activity.module}</Badge>
                      <span className="text-xs text-muted-foreground">{relativeTime(activity.createdAt)}</span>
                    </div>
                    <h3 className="line-clamp-2 font-bold text-foreground">{activity.title}</h3>
                    {activity.type === "comment" ? (
                      <p className="rounded-lg border bg-background p-3 text-sm leading-7 text-muted-foreground">
                        {activity.text || "دیدگاه بدون متن"}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">این کاربر این محتوا را پسندیده است.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
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
