import { getBySlug, getModuleItems } from "@/lib/content";
import { getDbPost } from "@/lib/server-post";
import { getSlugRedirect } from "@/lib/slug-redirects";
import { redirect } from "next/navigation";
import DbContentDetail from "@/features/content/components/DbContentDetail";

export const dynamicParams = true;
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
 return [];
}

export default async function BlogDetail({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params;
 const dbItem = await getDbPost("blog", slug);
 if (!dbItem) {
   const target = await getSlugRedirect("blog", slug);
   if (target) redirect(`/${target.targetModule}/${target.targetSlug}`);
 }
 const item = getBySlug("blog", slug);
 return <DbContentDetail module="blog" slug={slug} fallback={item} />;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params;
 const item = await getDbPost("blog", slug);
 return { title: item ? `${item.title} | تکباکس` : "تکباکس" };
}
