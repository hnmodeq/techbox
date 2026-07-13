import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/effects/PageHeader";
import { Icon } from "@/design/icons";
import { CardStats } from "@/components/ui/card-stats";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { blurProps } from "@/lib/image-placeholder";
import { ensureSavedContentTable } from "@/lib/saved-content-table";
import { UserActivityList, type UserActivity } from "@/components/profile/UserActivityList";

const contentModules = ["blog", "review", "media", "forum", "news"];

function PostGrid({ posts, title, empty }: { posts: any[]; title: string; empty: string }) {
  return (
    <section className="mt-10 space-y-4">
      <h2 className="border-b pb-3 text-xl font-black text-foreground">{title}</h2>
      {posts.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">{empty}</CardContent></Card>
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
                <div className="mt-3 border-t pt-3"><CardStats module={post.module} slug={post.slug} showComments /></div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default async function AuthorProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const cleanUser = decodeURIComponent(username).toLowerCase();
  const user = await prisma.user.findFirst({ where: { OR: [{ username: cleanUser }, { name: cleanUser }] } }).catch(() => null);

  if (!user) return <main className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground" dir="rtl">کاربر پیدا نشد.</main>;

  const authoredPosts = await prisma.post.findMany({
    where: { published: true, deletedAt: null, module: { in: contentModules }, OR: [{ authorId: user.id }, { authorName: user.name }] },
    orderBy: { date: "desc" },
    include: { comments: true },
  }).catch(() => []);
  const isAuthor = authoredPosts.length > 0 || ["super_admin", "admin", "editor"].includes(user.role);

  const totalViews = authoredPosts.reduce((acc: number, p: any) => acc + (p.views || 0), 0);
  const totalLikes = authoredPosts.reduce((acc: number, p: any) => acc + (p.likes || 0), 0);
  const totalComments = authoredPosts.reduce((acc: number, p: any) => acc + (p.comments?.length || 0), 0);

  let activities: UserActivity[] = [];
  let savedPosts: any[] = [];

  if (!isAuthor) {
    const likes = await prisma.like.findMany({
      where: {
        OR: [{ userId: user.id }, { fingerprint: user.id }],
        module: { in: contentModules },
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }).catch(() => []);

    const likedPostMap = new Map<string, any>();
    if (likes.length) {
      const likedPosts = await prisma.post.findMany({
        where: { published: true, deletedAt: null, OR: likes.map((like: any) => ({ module: like.module, slug: like.slug })) },
      }).catch(() => []);
      likedPosts.forEach((post: any) => likedPostMap.set(`${post.module}:${post.slug}`, post));
    }

    const likeActivities: UserActivity[] = likes
      .map((like: any) => {
        const post = likedPostMap.get(`${like.module}:${like.slug}`);
        if (!post) return null;
        return {
          id: `like-${like.id}`,
          type: "like" as const,
          module: post.module,
          slug: post.slug,
          title: post.title,
          image: post.image,
          excerpt: post.excerpt,
          createdAt: like.createdAt.toISOString(),
        };
      })
      .filter(Boolean) as UserActivity[];

    const comments = await prisma.comment.findMany({
      where: {
        authorId: user.id,
        deletedAt: null,
        post: { module: { in: contentModules }, published: true, deletedAt: null },
      },
      include: { post: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }).catch(() => []);

    const commentActivities: UserActivity[] = comments.map((comment: any) => ({
      id: `comment-${comment.id}`,
      type: "comment" as const,
      module: comment.post.module,
      slug: comment.post.slug,
      title: comment.post.title,
      image: comment.post.image,
      excerpt: comment.post.excerpt,
      text: comment.text,
      createdAt: comment.createdAt.toISOString(),
    }));

    activities = [...likeActivities, ...commentActivities].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

    try {
      await ensureSavedContentTable();
      const savedRows = await prisma.$queryRawUnsafe(`SELECT "module", "slug" FROM "SavedContent" WHERE "userId"=$1 ORDER BY "createdAt" DESC LIMIT 60`, user.id);
      const savedRowsList = savedRows as Array<{ module: string; slug: string }>;
      if (savedRowsList.length) {
        savedPosts = await prisma.post.findMany({ where: { published: true, deletedAt: null, OR: savedRowsList.map((saved: any) => ({ module: saved.module, slug: saved.slug })) }, orderBy: { date: "desc" } }).catch(() => []);
      }
    } catch {}
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12" dir="rtl">
      <PageHeader colorVar="--home" title={`${isAuthor ? "پروفایل نویسنده" : "حساب کاربری"}: ${user.name}`} titleClassName="text-foreground">
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><span>@{user.username}</span></div>
      </PageHeader>
      <Card className="mt-8 p-0">
        <CardContent className="grid gap-6 p-6 sm:p-8 md:grid-cols-[160px_1fr] md:items-center">
          <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full border shadow-sm">
            <Image src={user.avatar || "/logo.png"} alt={user.name} fill className="object-cover" sizes="128px" {...blurProps(user.avatar || "/logo.png")} />
          </div>
          <div className="space-y-4 text-right">
            <div><span className="inline-flex rounded-md bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">{isAuthor ? (user.job || user.roleFa || user.role) : "کاربر تکباکس"}</span><h1 className="mt-2 text-2xl font-black text-foreground sm:text-3xl">{user.name}</h1></div>
            <p className="text-muted-foreground">{user.job || (isAuthor ? "عضو تحریریه تکباکس" : "عضو جامعه تکباکس")}</p>
            {isAuthor && <div className="flex flex-wrap items-center gap-6 border-t pt-3 text-xs font-bold text-muted-foreground sm:text-sm"><span className="flex items-center gap-1.5 text-foreground"><Icon name="blog" size={18} /> محتوا: <b>{authoredPosts.length.toLocaleString("fa-IR")}</b></span><span className="flex items-center gap-1.5 text-foreground"><Icon name="view" size={18} /> بازدید: <b>{totalViews.toLocaleString("fa-IR")}</b></span><span className="flex items-center gap-1.5 text-foreground"><Icon name="like" size={18} /> پسند: <b>{totalLikes.toLocaleString("fa-IR")}</b></span><span className="flex items-center gap-1.5 text-foreground"><Icon name="comment" size={18} /> دیدگاه: <b>{totalComments.toLocaleString("fa-IR")}</b></span></div>}
          </div>
        </CardContent>
      </Card>

      {isAuthor ? (
        <PostGrid posts={authoredPosts} title="محتواهای منتشرشده" empty="هنوز محتوایی ثبت نشده است." />
      ) : (
        <>
          <UserActivityList activities={activities} />
          <PostGrid posts={savedPosts} title="محتواهای ذخیره‌شده" empty="هنوز محتوایی ذخیره نشده است." />
        </>
      )}
    </main>
  );
}
