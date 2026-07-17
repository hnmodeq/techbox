import { getDbPost } from "@/lib/server-post";
import { detailMetadata } from "@/lib/seo";
import { getSlugRedirect } from "@/lib/slug-redirects";
import { redirect } from "next/navigation";
import DbReviewDetail from "@/features/review/components/DbReviewDetail";

export const dynamicParams = true;
export const revalidate = 3600;

type P = Promise<{ slug: string }>;

export default async function Page({ params }: { params: P }) {
  const { slug } = await params;
  const dbItem = await getDbPost("review", slug);
  if (!dbItem) {
    const target = await getSlugRedirect("review", slug);
    if (target) redirect(`/${target.targetModule}/${target.targetSlug}`);
  }
  return <DbReviewDetail slug={slug} fallback={dbItem} />;
}

export async function generateMetadata({ params }: { params: P }) {
  const { slug } = await params;
  const item = await getDbPost("review", slug);
  return detailMetadata("review", item, "نقد و بررسی تکباکس");
}
