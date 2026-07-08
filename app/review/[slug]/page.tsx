import { getBySlug, getModuleItems } from "@/lib/content";
import { getDbPost } from "@/lib/server-post";
import DbReviewDetail from "@/features/review/components/DbReviewDetail";

export const dynamicParams = true;

type P = Promise<{ slug: string }>;

export async function generateStaticParams() {
 return [];
}

export default async function Page({ params }: { params: P }) {
 const { slug } = await params;
 const mod = "review" as any;
 const item = getBySlug(mod, slug);
 return <DbReviewDetail slug={slug} fallback={item} />;
}

export async function generateMetadata({ params }: { params: P }) {
 const { slug } = await params;
 const item = await getDbPost("review", slug);
 return { title: item ? `${item.title} | نقد و بررسی تکباکس` : "نقد و بررسی تکباکس" };
}
