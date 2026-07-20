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

// ─── Author content grid ──────────────────────────────────────────────────────

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

// ─── Tabs shell ───────────────────────────────────────────────────────────────

export function ProfileTabs({
  isAuthor,
  authoredPosts,
  activities,
}: {
  isAuthor: boolean
  authoredPosts: any[]
  activities: UserActivity[]
}) {
  // Authors: two tabs — user activity + content activity
  // Normal users: activity inline, no tab chrome
  if (isAuthor) {
    return (
      <Tabs defaultValue="user" className="mt-10">
        <TabsList className="flex h-auto flex-wrap gap-1 mb-6">
          <TabsTrigger value="user">فعالیت کاربری</TabsTrigger>
          <TabsTrigger value="author">فعالیت محتوایی</TabsTrigger>
        </TabsList>

        <TabsContent value="user" className="pt-2">
          <UserActivityList activities={activities} />
        </TabsContent>

        <TabsContent value="author" className="pt-2">
          <AuthorPosts posts={authoredPosts} />
        </TabsContent>
      </Tabs>
    )
  }

  // Normal user — no tab chrome
  return (
    <div className="mt-10 space-y-8">
      <UserActivityList activities={activities} />
    </div>
  )
}
