"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { CardStats } from "@/components/ui/card-stats"
import { UserActivityList, type UserActivity } from "@/components/profile/UserActivityList"
import { blurProps } from "@/lib/image-placeholder"
import { formatRelativeDate } from "@/lib/date-format"
import { useModuleTitles } from "@/providers/module-config.provider"

// ─── Author content grid (same as before) ────────────────────────────────────

function AuthorPosts({ posts }: { posts: any[] }) {
  return (
    <section className="space-y-4">
      <h2 className="border-b pb-3 text-xl font-black text-foreground">فعالیت محتوایی</h2>
      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            هنوز محتوایی ثبت نشده است.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: any) => (
            <Link
              key={`${post.module}:${post.slug}`}
              href={`/${post.module}/${post.slug}`}
              className="group overflow-hidden rounded-xl border bg-card transition-colors hover:bg-muted/40"
            >
              <div className="relative aspect-[16/10] bg-muted">
                {post.image && (
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="350px"
                    {...blurProps(post.image)}
                  />
                )}
              </div>
              <div className="p-4">
                <div className="text-xs text-muted-foreground">
                  {formatRelativeDate(post.date)} • {post.category || post.module}
                </div>
                <h3 className="mt-2 line-clamp-2 font-bold text-foreground">{post.title}</h3>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{post.excerpt}</p>
                <div className="mt-3 border-t pt-3">
                  <CardStats
                    module={post.module}
                    slug={post.slug}
                    initialViews={post.views}
                    initialLikes={post.likes}
                    initialComments={post.comments || 0}
                    showComments
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── Saved posts — same horizontal-row card design as /account ────────────────

function SavedPosts({ posts }: { posts: any[] }) {
  // Call hook at top level — gives us all module titles at once
  const titles = useModuleTitles()

  return (
    <section className="space-y-4">
      <h2 className="border-b pb-3 text-xl font-black text-foreground">ذخیره‌شده‌ها</h2>
      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            هنوز محتوایی ذخیره نشده است.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {posts.map((post: any) => {
            const isTopic = post.module === "forum"
            const moduleLabel = titles[post.module as keyof typeof titles] || post.module

            return (
              <Link
                key={`${post.module}:${post.slug}`}
                href={`/${post.module}/${post.slug}`}
                className="group flex gap-3 rounded-lg border bg-card p-3 transition hover:bg-muted/40"
              >
                {/* Thumbnail — shown for all non-forum modules that have an image */}
                {!isTopic && post.image && (
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                      unoptimized
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {/* Date + module badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeDate(post.date)}
                    </span>
                    <span
                      className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium"
                      style={{ color: `var(--${post.module})` }}
                    >
                      {moduleLabel}
                    </span>
                  </div>

                  {/* Title */}
                  <div className="mt-0.5 line-clamp-1 font-semibold text-foreground group-hover:underline">
                    {post.title}
                  </div>

                  {/* Forum: show author name; others: show excerpt */}
                  {isTopic && post.authorName && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      توسط {post.authorName}
                    </div>
                  )}
                  {!isTopic && post.excerpt && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}

// ─── Tabs shell ───────────────────────────────────────────────────────────────

export function ProfileTabs({
  isAuthor,
  authoredPosts,
  activities,
  savedPosts,
  isSelf,
}: {
  isAuthor: boolean
  authoredPosts: any[]
  activities: UserActivity[]
  savedPosts: any[]
  isSelf: boolean
}) {
  // Authors get two tabs: user activity + content activity.
  // Normal users: activity shown inline, no tab chrome.
  if (isAuthor) {
    return (
      <Tabs defaultValue="user" className="mt-10">
        <TabsList className="flex h-auto flex-wrap gap-1 mb-6">
          <TabsTrigger value="user">فعالیت کاربری</TabsTrigger>
          <TabsTrigger value="author">فعالیت محتوایی</TabsTrigger>
          {isSelf && <TabsTrigger value="saved">ذخیره‌ها</TabsTrigger>}
        </TabsList>

        <TabsContent value="user" className="pt-2">
          <UserActivityList activities={activities} />
        </TabsContent>

        <TabsContent value="author" className="pt-2">
          <AuthorPosts posts={authoredPosts} />
        </TabsContent>

        {isSelf && (
          <TabsContent value="saved" className="pt-2">
            <SavedPosts posts={savedPosts} />
          </TabsContent>
        )}
      </Tabs>
    )
  }

  // Normal user — no tab chrome needed
  return (
    <div className="mt-10 space-y-8">
      <UserActivityList activities={activities} />
      {isSelf && savedPosts.length > 0 && <SavedPosts posts={savedPosts} />}
    </div>
  )
}
