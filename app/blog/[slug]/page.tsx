import { getBySlug, getModuleItems } from "@/lib/content";
import DbContentDetail from "@/features/content/components/DbContentDetail";

export async function generateStaticParams() {
 return getModuleItems("blog").map(p => ({ slug: p.slug }));
}

export default async function BlogDetail({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params;
 const item = getBySlug("blog", slug);
 return <DbContentDetail module="blog" slug={slug} fallback={item} />;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params;
 const item = getBySlug("blog", slug);
 return { title: item ? `${item.title} | تکباکس`: "یافت نشد" };
}
