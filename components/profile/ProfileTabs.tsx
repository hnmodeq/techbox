"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { CardStats } from "@/components/ui/card-stats"
import { UserActivityList, type UserActivity } from "@/components/profile/UserActivityList"
import { blurProps } from "@/lib/image-placeholder"

function AuthorPosts({ posts, title = "محتواهای منتشرشده" }: { posts: any[]; title?: string }) {
  return (
    <section className="space-y-4">
      <h2 className="border-b pb-3 text-xl font-black text-foreground">{title}</h2>
      {posts.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">هنوز محتوایی ثبت نشده است.</CardContent></Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: any) => (
            <Link key={`${post.module}:${post.slug}`} href={`/${post.module}/${post.slug}`} className="group overflow-hidden rounded-xl border bg-card transition-colors hover:bg-muted/40">
              <div className="relative aspect-[16/10] bg-muted">
                {post.image && <Image src={post.image} alt={post.title} fill className="object-cover transition-transform group-hover:scale-105" sizes="350px" {...blurProps(post.image)} />}
              </div>
              <div className="p-4">
                <div className="text-xs text-muted-foreground">{post.dateFa || post.date_fa} • {post.category || post.module}</div>
                <h3 className="mt-2 line-clamp-2 font-bold text-foreground">{post.title}</h3>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{post.excerpt}</p>
                <div className="mt-3 border-t pt-3"><CardStats module={post.module} slug={post.slug} initialViews={post.views} initialLikes={post.likes} initialComments={post.comments || 0} showComments /></div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

function SavedPosts({ posts }: { posts: any[] }) {
  return <AuthorPosts posts={posts} title="محتواهای ذخیره‌شده" />
}

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
  // Authors get two tabs: user activity + author content.
  // Normal users just see activity inline — no tab chrome.
  if (isAuthor) {
    return (
      <Tabs defaultValue="user" className="mt-10">
        <TabsList className="flex h-auto flex-wrap gap-1 mb-6">
          <TabsTrigger value="user">فعالیت کاربری</TabsTrigger>
          <TabsTrigger value="author">فعالیت نویسنده</TabsTrigger>
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

  // Normal user: show activity directly
  return (
    <div className="mt-10 space-y-8">
      <UserActivityList activities={activities} />
      {isSelf && savedPosts.length > 0 && <SavedPosts posts={savedPosts} />}
    </div>
  )
}
