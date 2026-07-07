import { getBySlug, getModuleItems } from "@/lib/content";
import DbReviewDetail from "@/features/review/components/DbReviewDetail";

type P = Promise<{ slug: string }>;

export async function generateStaticParams() {
 const mod = "review" as any;
 return getModuleItems(mod).map((p) => ({ slug: p.slug }));
}

export default async function Page({ params }: { params: P }) {
 const { slug } = await params;
 const mod = "review" as any;
 const item = getBySlug(mod, slug);
 return <DbReviewDetail slug={slug} fallback={item} />;
}

export async function generateMetadata({ params }: { params: P }) {
 const { slug } = await params;
 const mod = "review" as any;
 const item = getBySlug(mod, slug);
 return { title: item ? `${item.title} | نقد و بررسی تکباکس`: "یافت نشد" };
}
