import Image from "next/image";
import { Heart } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { Icon } from "@/design/icons";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { blurProps } from "@/lib/image-placeholder";
import { getSessionUserPublic } from "@/lib/auth-server";
import { getUserActivities, getProfileContentModulesForAuthor } from "@/lib/user-activity";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { FollowButton } from "@/components/profile/FollowButton";
import { FollowStats } from "@/components/profile/FollowStats";

export default async function AuthorProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const cleanUser = decodeURIComponent(username).toLowerCase();

  const [user, viewer] = await Promise.all([
    prisma.user.findFirst({ where: { OR: [{ username: cleanUser }, { name: cleanUser }] } }).catch(() => null),
    getSessionUserPublic().catch(() => null),
  ]);

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground" dir="rtl">
        کاربر پیدا نشد.
      </main>
    );
  }

  // Only personal-authorship modules — media/news/shop have no personal author
  const authorModules = await getProfileContentModulesForAuthor();

  const authoredPosts = await prisma.post.findMany({
    where: {
      published: true,
      deletedAt: null,
      module: { in: authorModules },
      OR: [{ authorId: user.id }, { authorName: user.name }],
    },
    orderBy: { date: "desc" },
    include: { comments: true },
  }).catch(() => []);

  const isAuthor = authoredPosts.length > 0 || ["super_admin", "admin", "editor"].includes(user.role);

  const totalViews = authoredPosts.reduce((acc: number, p: any) => acc + (p.views || 0), 0);
  const totalLikes = authoredPosts.reduce((acc: number, p: any) => acc + (p.likes || 0), 0);
  const totalComments = authoredPosts.reduce((acc: number, p: any) => acc + (p.comments?.length || 0), 0);

  // Pre-load follow data server-side — zero loading flash
  const [followersCount, followingCount, isFollowing] = await Promise.all([
    prisma.follow.count({ where: { followingId: user.id } }).catch(() => 0),
    prisma.follow.count({ where: { followerId: user.id } }).catch(() => 0),
    viewer && viewer.id !== user.id
      ? prisma.follow
          .findUnique({ where: { followerId_followingId: { followerId: viewer.id, followingId: user.id } } })
          .then((r) => !!r)
          .catch(() => false)
      : Promise.resolve(false),
  ]);

  const activities = await getUserActivities(user.id);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12" dir="rtl">
      <Card className="mt-4 p-0">
        <CardContent className="p-6 sm:p-8">
          {/* Two-column: right = avatar/name/bio/stats | left = follow counts + button */}
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">

            {/* ── RIGHT side: avatar + name + bio + stat icons ── */}
            <div className="flex flex-1 flex-col items-center gap-4 sm:flex-row sm:items-start">
              {/* Avatar */}
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border shadow-sm">
                <Image
                  src={user.avatar || "/logo.png"}
                  alt={user.name}
                  fill
                  className="object-cover"
                  sizes="112px"
                  {...blurProps(user.avatar || "/logo.png")}
                />
              </div>

              {/* Name / role / bio / stat icons */}
              <div className="min-w-0 flex-1 space-y-3 text-right">
                {/* Role badge — single source, no duplicate */}
                <span className="inline-flex rounded-md bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                  {user.job || user.roleFa || "کاربر تکباکس"}
                </span>

                <div>
                  <h1 className="text-2xl font-black text-foreground sm:text-3xl flex items-center gap-2">
                    {user.name}
                    {(user as any).verifiedType && (
                      <VerifiedBadge
                        type={(user as any).verifiedType as "content" | "org" | "user"}
                        label={(user as any).verifiedLabel}
                        size={22}
                      />
                    )}
                  </h1>
                  <div className="mt-0.5 font-mono text-xs text-muted-foreground" dir="ltr">
                    @{user.username}
                  </div>
                </div>

                {/* Bio only — no second job title */}
                {user.bio && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{user.bio}</p>
                )}

                {/* Author stat icons with tooltips — no text labels */}
                {isAuthor && (
                  <TooltipProvider>
                    <div className="flex flex-wrap items-center gap-5 border-t pt-3">
                      <Tooltip>
                        <TooltipTrigger render={<span className="flex items-center gap-1.5 cursor-default text-foreground" />}>
                          <Icon name="blog" size={16} className="text-muted-foreground" />
                          <b className="tabular-nums text-sm">{authoredPosts.length.toLocaleString("fa-IR")}</b>
                        </TooltipTrigger>
                        <TooltipContent>تعداد محتواهای منتشر شده توسط این کاربر</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger render={<span className="flex items-center gap-1.5 cursor-default text-foreground" />}>
                          <Icon name="view" size={16} className="text-muted-foreground" />
                          <b className="tabular-nums text-sm">{totalViews.toLocaleString("fa-IR")}</b>
                        </TooltipTrigger>
                        <TooltipContent>تعداد بازدید از محتواهای این کاربر</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger render={<span className="flex items-center gap-1.5 cursor-default text-foreground" />}>
                          {/* Red filled heart */}
                          <Heart size={16} fill="currentColor" className="text-red-500" />
                          <b className="tabular-nums text-sm">{totalLikes.toLocaleString("fa-IR")}</b>
                        </TooltipTrigger>
                        <TooltipContent>تعداد پسندها بر روی محتواهای این کاربر</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger render={<span className="flex items-center gap-1.5 cursor-default text-foreground" />}>
                          <Icon name="comment" size={16} className="text-muted-foreground" />
                          <b className="tabular-nums text-sm">{totalComments.toLocaleString("fa-IR")}</b>
                        </TooltipTrigger>
                        <TooltipContent>تعداد دیدگاه‌های ثبت شده بر روی محتواهای این کاربر</TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                )}
              </div>
            </div>

            {/* ── LEFT side: follow stats + follow button ── */}
            <div className="flex shrink-0 flex-col items-start gap-3 md:items-end md:border-r md:pr-8">
              <FollowStats
                username={user.username}
                viewerId={viewer?.id}
                initialFollowersCount={followersCount}
                initialFollowingCount={followingCount}
              />
              {viewer && viewer.id !== user.id && (
                <FollowButton
                  targetUserId={user.id}
                  viewerId={viewer.id}
                  initialIsFollowing={isFollowing}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ProfileTabs
        isAuthor={isAuthor}
        authoredPosts={authoredPosts}
        activities={activities}
      />
    </main>
  );
}
