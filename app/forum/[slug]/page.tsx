import { getBySlug, getModuleItems } from "@/lib/content";
import ForumDetail from "@/features/forum/components/ForumDetail";
import { notFound } from "next/navigation";

type P = Promise<{ slug: string }>;

export async function generateStaticParams() {
 const mod = "forum" as any;
 return getModuleItems(mod).map((p) => ({ slug: p.slug }));
}

export default async function Page({ params }: { params: P }) {
 const { slug } = await params;
 const mod = "forum" as any;
 const item = getBySlug(mod, slug);
 if (!item) return notFound();
 return <ForumDetail item={item} />;
}

export async function generateMetadata({ params }: { params: P }) {
 const { slug } = await params;
 const mod = "forum" as any;
 const item = getBySlug(mod, slug);
 return { title: item ? `${item.title} | انجمن تکباکس`: "یافت نشد" };
}
