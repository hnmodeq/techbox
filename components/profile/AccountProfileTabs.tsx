"use client"

import { formatRelativeDate } from "@/lib/date-format";
import * as React from "react"
import Link from "next/link"
import Image from "next/image"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { CardStats } from "@/components/ui/card-stats"
import { UserActivityList, type UserActivity } from "@/components/profile/UserActivityList"
import { useModuleTitle } from "@/providers/module-config.provider"
import { blurProps } from "@/lib/image-placeholder"

function AuthorPosts({ posts }: { posts: any[] }) {
  return (
    <section className="space-y-4">
      <h2 className="border-b pb-3 text-xl font-black text-foreground">فعالیت محتوایی</h2>
      {posts.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">هنوز محتوایی منتشر نکرده‌اید.</CardContent></Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: any) => (
            <Link key={`${post.module}:${post.slug}`} href={`/${post.module}/${post.slug}`} className="group overflow-hidden rounded-xl border bg-card transition-colors hover:bg-muted/40">
              <div className="relative aspect-[16/10] bg-muted">
                {post.image && <Image src={post.image} alt={post.title} fill className="object-cover transition-transform group-hover:scale-105" sizes="350px" quality={75} />}
              </div>
              <div className="p-4">
                <div className="text-xs text-muted-foreground">{formatRelativeDate(post.date)} • {post.category || post.module}</div>
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

function SavedPosts({ posts, loading }: { posts: any[]; loading?: boolean }) {
  // Call the hook once at the top level of the component
  const moduleTitle = (module: string) => useModuleTitle(module as any, module);

  if (loading) {
    return (
      <section className="space-y-4">
        <h2 className="border-b pb-3 text-xl font-black text-foreground">ذخیره شده ها</h2>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 rounded-lg border bg-card p-3 animate-pulse">
              <div className="h-12 w-16 rounded-md bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-1/2 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <h2 className="border-b pb-3 text-xl font-black text-foreground">ذخیره شده ها</h2>
      {posts.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">محتوایی ذخیره نکرده‌اید.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {posts.map((post: any) => {
            const isTopic = post.module === "forum";
            return (
              <Link key={`${post.module}:${post.slug}`} href={`/${post.module}/${post.slug}`} className="group flex gap-3 rounded-lg border bg-card p-3 transition hover:bg-muted/40">
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
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{formatRelativeDate(post.date)}</span>
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {moduleTitle(post.module)}
                    </span>
                  </div>
                  <div className="mt-0.5 line-clamp-1 font-semibold text-foreground group-hover:underline">{post.title}</div>
                  {isTopic && post.authorName && (
                    <div className="text-xs text-muted-foreground mt-0.5">توسط {post.authorName}</div>
                  )}
                  {!isTopic && post.excerpt && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{post.excerpt}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  )
}

export function AccountProfileTabs({ profileEditor }: { profileEditor: React.ReactNode }) {
  const [activities, setActivities] = React.useState<UserActivity[]>([])
  const [authoredPosts, setAuthoredPosts] = React.useState<any[]>([])
  const [savedPosts, setSavedPosts] = React.useState<any[]>([])
  const [isAuthor, setIsAuthor] = React.useState(false)
  const [savedLoading, setSavedLoading] = React.useState(true)

  React.useEffect(() => {
    fetch("/api/account/activity", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return
        setActivities(data.activities || [])
        setAuthoredPosts(data.authoredPosts || [])
        setSavedPosts(data.savedPosts || [])
        setIsAuthor(Boolean(data.isAuthor))
      })
      .catch(() => {})
      .finally(() => setSavedLoading(false))
  }, [])

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="flex h-auto flex-wrap gap-1">
        <TabsTrigger value="profile">ویرایش اطلاعات حساب کاربری</TabsTrigger>
        <TabsTrigger value="activity">فعالیت کاربر</TabsTrigger>
        <TabsTrigger value="saved">ذخیره شده ها</TabsTrigger>
        <TabsTrigger value="author">فعالیت محتوایی</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">{profileEditor}</TabsContent>
      <TabsContent value="activity"><UserActivityList activities={activities} /></TabsContent>
      <TabsContent value="saved"><SavedPosts posts={savedPosts} loading={savedLoading} /></TabsContent>
      <TabsContent value="author">
        {isAuthor ? (
          <AuthorPosts posts={authoredPosts} />
        ) : (
          <Card><CardContent className="p-8 text-center text-muted-foreground">شما محتوای منتشر شده‌ای ندارید.</CardContent></Card>
        )}
      </TabsContent>
    </Tabs>
  )
}
