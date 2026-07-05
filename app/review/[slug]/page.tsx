import { getBySlug, getModuleItems } from "@/lib/content";
import ReviewDetail from "@/features/review/components/ReviewDetail";
import { notFound } from "next/navigation";

type P = Promise<{ slug: string }>;

export async function generateStaticParams() {
 const mod = "review" as any;
 const items = await getModuleItems(mod);
 return items.map((p) => ({ slug: p.slug }));
}

export default async function Page({ params }: { params: P }) {
 const { slug } = await params;
 const mod = "review" as any;
 const item = await getBySlug(mod, slug);
 if (!item) return notFound();
 return <ReviewDetail item={item} />;
}

export async function generateMetadata({ params }: { params: P }) {
 const { slug } = await params;
 const mod = "review" as any;
 const item = await getBySlug(mod, slug);
 return { title: item ? `${item.title} | نقد و بررسی تکباکس`: "یافت نشد" };
}