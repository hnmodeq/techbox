import Image from "next/image";
import { blurProps } from "@/lib/image-placeholder";
import Link from "next/link";
import PageHeader from "@/components/effects/PageHeader";
import { Icon } from "@/design/icons";
import { CardStats } from "@/components/ui/card-stats";
import { prisma } from "@/lib/db";

function safeJsonArray(value: string | null | undefined): string[] { try { const p = JSON.parse(value || "[]"); return Array.isArray(p) ? p : []; } catch { return []; } }

export default async function AuthorProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const cleanUser = decodeURIComponent(username).toLowerCase();
  const user = await prisma.user.findFirst({ where: { OR: [{ username: cleanUser }, { name: cleanUser }] } }).catch(() => null);

  if (!user) {
    return <main className="mx-auto max-w-3xl px-4 py-16 text-center paragraph-color" dir="rtl">نویسنده پیدا نشد.</main>;
  }

  const posts = await prisma.post.findMany({ where: { published: true, OR: [{ authorId: user.id }, { authorName: user.name }] }, orderBy: { date: "desc" }, include: { comments: true } }).catch(() => []);
  const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalLikes = posts.reduce((acc, p) => acc + (p.likes || 0), 0);
  const totalComments = posts.reduce((acc, p) => acc + (p.comments?.length || 0), 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12" dir="rtl">
      <PageHeader colorVar="--home" title={`پروفایل: ${user.name}`} titleClassName="text-[var(--primary-text)]">
        <div className="flex items-center gap-2 text-sm paragraph-color"><span>@{user.username}</span></div>
      </PageHeader>
      <div className="mt-8 rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-6 sm:p-8 shadow-[var(--shadow-size)] grid md:grid-cols-[160px_1fr] gap-6 items-center">
        <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full border-[length:var(--border-size)] border-[var(--home)] shadow-[var(--shadow-size)]">
          <Image src={user.avatar || "/logo.png"} alt={user.name} fill className="object-cover" sizes="128px" {...blurProps(user.avatar || "/logo.png")} />
        </div>
        <div className="space-y-4 text-right">
          <div><span className="badge bg-[var(--home)]/15 text-[var(--home)] border-[length:var(--border-size)] border-[var(--home)]/30 font-bold px-3 py-1 text-xs">{user.roleFa || user.role}</span><h1 className="mt-2 text-2xl sm:text-3xl font-black text-[var(--primary-text)]">{user.name}</h1></div>
          <p className="paragraph-color">{user.job || "عضو جامعه تکباکس"}</p>
          <div className="pt-3 border-t-[length:var(--border-size)] border-[var(--border-color)] flex flex-wrap items-center gap-6 text-xs sm:text-sm font-bold paragraph-color">
            <span className="flex items-center gap-1.5 text-[var(--primary-text)]"><Icon name="blog" size={18} className="text-[var(--home)]" /> محتوا: <b>{posts.length.toLocaleString("fa-IR")}</b></span>
            <span className="flex items-center gap-1.5 text-[var(--primary-text)]"><Icon name="view" size={18} className="text-[var(--blog)]" /> بازدید: <b>{totalViews.toLocaleString("fa-IR")}</b></span>
            <span className="flex items-center gap-1.5 text-[var(--primary-text)]"><Icon name="like" size={18} className="text-red-400" /> پسند: <b>{totalLikes.toLocaleString("fa-IR")}</b></span>
            <span className="flex items-center gap-1.5 text-[var(--primary-text)]"><Icon name="comment" size={18} className="text-[var(--info)]" /> دیدگاه: <b>{totalComments.toLocaleString("fa-IR")}</b></span>
          </div>
        </div>
      </div>
      <div className="mt-12 space-y-6"><h2 className="text-xl font-black text-[var(--primary-text)] border-b-[length:var(--border-size)] border-[var(--border-color)] pb-4">آرشیو محتوا</h2>{posts.length === 0 ? <div className="p-12 text-center paragraph-color">هنوز محتوایی ثبت نشده است.</div> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <Link key={post.id} href={`/${post.module}/${post.slug}`} className="group rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] overflow-hidden"><div className="relative aspect-[16/10] bg-[var(--muted-background)]">{post.image && <Image src={post.image} alt={post.title} fill className="object-cover transition-transform group-hover:scale-105" sizes="350px" {...blurProps(post.image)} />}</div><div className="p-4"><div className="text-xs paragraph-color">{post.dateFa} • {post.category || post.module}</div><h3 className="mt-2 font-bold text-[var(--primary-text)] group-hover:text-[var(--home)] line-clamp-2">{post.title}</h3><p className="mt-2 text-xs paragraph-color line-clamp-2">{post.excerpt}</p><div className="mt-3 border-t-[length:var(--border-size)] border-[var(--border-color)] pt-3"><CardStats module={post.module} slug={post.slug} showComments /></div></div></Link>)}</div>}</div>
    </main>
  );
}
