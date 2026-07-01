import { getBySlug, getModuleItems } from "@/lib/content";
import ContentDetail from "@/features/content/components/ContentDetail";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
 return getModuleItems("blog").map(p => ({ slug: p.slug }));
}

export default async function BlogDetail({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params;
 const item = getBySlug("blog", slug);
 if (!item) return notFound();
 return <ContentDetail item={item} />;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params;
 const item = getBySlug("blog", slug);
 return { title: item ? `${item.title} | تکباکس`: "یافت نشد" };
}
