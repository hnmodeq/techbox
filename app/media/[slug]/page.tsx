import { getDbPost } from "@/lib/server-post";
import { detailMetadata } from "@/lib/seo";
import { getSlugRedirect } from "@/lib/slug-redirects";
import { redirect } from "next/navigation";
import DbContentDetail from "@/features/content/components/DbContentDetail";

export const dynamicParams = true;
export const revalidate = 3600;

type P = Promise<{ slug: string }>;

export default async function Page({ params }: { params: P }) {
  const { slug } = await params;
  const dbItem = await getDbPost("media", slug);
  if (!dbItem) {
    const target = await getSlugRedirect("media", slug);
    if (target) redirect(`/${target.targetModule}/${target.targetSlug}`);
  }
  return <DbContentDetail module="media" slug={slug} fallback={dbItem} />;
}

export async function generateMetadata({ params }: { params: P }) {
  const { slug } = await params;
  const item = await getDbPost("media", slug);
  return detailMetadata("media", item, "رسانه تکباکس");
}
