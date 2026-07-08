import { getBySlug, getModuleItems } from "@/lib/content";
import { getDbPost } from "@/lib/server-post";
import { getSlugRedirect } from "@/lib/slug-redirects";
import { redirect } from "next/navigation";
import DbProductDetail from "@/features/shop/components/DbProductDetail";

export const dynamicParams = true;
export const dynamic = "force-dynamic";

type P = Promise<{ slug: string }>;

export async function generateStaticParams() {
 return [];
}

export default async function Page({ params }: { params: P }) {
 const { slug } = await params;
 const mod = "shop" as any;
 const item = getBySlug(mod, slug);
 return <DbProductDetail slug={slug} fallback={item} />;
}

export async function generateMetadata({ params }: { params: P }) {
 const { slug } = await params;
 const item = await getDbPost("shop", slug);
 return { title: item ? `${item.title} | فروشگاه تکباکس` : "فروشگاه تکباکس" };
}
