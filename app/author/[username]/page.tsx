import Image from "next/image";
import PageHeader from "@/components/effects/PageHeader";
import { Icon } from "@/design/icons";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { blurProps } from "@/lib/image-placeholder";
import { getSessionUserPublic } from "@/lib/auth-server";
import { getUserActivities, getProfileContentModules } from "@/lib/user-activity";
import { ProfileTabs } from "@/components/profile/ProfileTabs";

export default async function AuthorProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const cleanUser = decodeURIComponent(username).toLowerCase();
  const [user, viewer] = await Promise.all([
    prisma.user.findFirst({ where: { OR: [{ username: cleanUser }, { name: cleanUser }] } }).catch(() => null),
    getSessionUserPublic().catch(() => null),
  ]);

  if (!user) return <main className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground" dir="rtl">کاربر پیدا نشد.</main>;

  const enabledModules = await getProfileContentModules();

  const authoredPosts = await prisma.post.findMany({
    where: { published: true, deletedAt: null, module: { in: enabledModules }, OR: [{ authorId: user.id }, { authorName: user.name }] },
    orderBy: { date: "desc" },
    include: { comments: true },
  }).catch(() => []);
  const isAuthor = authoredPosts.length > 0 || ["super_admin", "admin", "editor"].includes(user.role);
  const isSelf = viewer?.id === user.id;

  const totalViews = authoredPosts.reduce((acc: number, p: any) => acc + (p.views || 0), 0);
  const totalLikes = authoredPosts.reduce((acc: number, p: any) => acc + (p.likes || 0), 0);
  const totalComments = authoredPosts.reduce((acc: number, p: any) => acc + (p.comments?.length || 0), 0);

  const activities = await getUserActivities(user.id);
  let savedPosts: any[] = [];
  if (isSelf) {
    try {
      const savedRows = await prisma.savedContent.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 60,
        select: { module: true, slug: true },
      });
      if (savedRows.length) {
        savedPosts = await prisma.post.findMany({ where: { published: true, deletedAt: null, OR: savedRows.map((saved) => ({ module: saved.module, slug: saved.slug })) }, orderBy: { date: "desc" } }).catch(() => []);
      }
    } catch {}
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12" dir="rtl">
      <PageHeader colorVar="--home" title={isAuthor ? "پروفایل نویسنده" : "حساب کاربری"} titleClassName="text-foreground" />
      <Card className="mt-8 p-0">
        <CardContent className="grid gap-6 p-6 sm:p-8 md:grid-cols-[160px_1fr] md:items-center">
          <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full border shadow-sm">
            <Image src={user.avatar || "/logo.png"} alt={user.name} fill className="object-cover" sizes="128px" {...blurProps(user.avatar || "/logo.png")} />
          </div>
          <div className="space-y-4 text-right">
            <div>
              <span className="inline-flex rounded-md bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                {isAuthor ? (user.job || user.roleFa || user.role) : (user.roleFa || "کاربر تکباکس")}
              </span>
              <h1 className="mt-2 text-2xl font-black text-foreground sm:text-3xl">{user.name}</h1>
              <div className="mt-1 font-mono text-xs text-muted-foreground" dir="ltr">@{user.username}</div>
            </div>
            {isAuthor && <p className="text-muted-foreground">{user.job || "عضو تحریریه تکباکس"}</p>}
            {isAuthor && <div className="flex flex-wrap items-center gap-6 border-t pt-3 text-xs font-bold text-muted-foreground sm:text-sm"><span className="flex items-center gap-1.5 text-foreground"><Icon name="blog" size={18} /> محتوا: <b>{authoredPosts.length.toLocaleString("fa-IR")}</b></span><span className="flex items-center gap-1.5 text-foreground"><Icon name="view" size={18} /> بازدید: <b>{totalViews.toLocaleString("fa-IR")}</b></span><span className="flex items-center gap-1.5 text-foreground"><Icon name="like" size={18} /> پسند: <b>{totalLikes.toLocaleString("fa-IR")}</b></span><span className="flex items-center gap-1.5 text-foreground"><Icon name="comment" size={18} /> دیدگاه: <b>{totalComments.toLocaleString("fa-IR")}</b></span></div>}
          </div>
        </CardContent>
      </Card>

      <ProfileTabs isAuthor={isAuthor} authoredPosts={authoredPosts} activities={activities} savedPosts={savedPosts} isSelf={isSelf} />
    </main>
  );
}
