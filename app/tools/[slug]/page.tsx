import { getBySlug, getModuleItems } from "@/lib/content";
import ContentDetail from "@/features/content/components/ContentDetail";
import { notFound } from "next/navigation";

type P = Promise<{ slug: string }>;

export async function generateStaticParams() {
 const mod = "tools" as any;
 return getModuleItems(mod).map((p) => ({ slug: p.slug }));
}

export default async function Page({ params }: { params: P }) {
 const { slug } = await params;
 const mod = "tools" as any;
 const item = getBySlug(mod, slug);
 if (!item) return notFound();
 return <ContentDetail item={item} />;
}

export async function generateMetadata({ params }: { params: P }) {
 const { slug } = await params;
 const mod = "tools" as any;
 const item = getBySlug(mod, slug);
 return { title: item ? `${item.title} | تکباکس`: "یافت نشد" };
}
