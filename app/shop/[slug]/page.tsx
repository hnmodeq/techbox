import { getDbPost } from "@/lib/server-post";
import { getSlugRedirect } from "@/lib/slug-redirects";
import { redirect } from "next/navigation";
import DbProductDetail from "@/features/shop/components/DbProductDetail";

export const dynamicParams = true;
export const dynamic = "force-dynamic";

type P = Promise<{ slug: string }>;

export default async function Page({ params }: { params: P }) {
  const { slug } = await params;
  const dbItem = await getDbPost("shop", slug);
  if (!dbItem) {
    const target = await getSlugRedirect("shop", slug);
    if (target) redirect(`/${target.targetModule}/${target.targetSlug}`);
  }
  return <DbProductDetail slug={slug} fallback={null} />;
}

export async function generateMetadata({ params }: { params: P }) {
  const { slug } = await params;
  const item = await getDbPost("shop", slug);
  return { title: item ? `${item.title} | فروشگاه تکباکس` : "فروشگاه تکباکس" };
}
