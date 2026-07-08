import { getDbPost } from "@/lib/server-post";
import { detailMetadata } from "@/lib/seo";
import { getSlugRedirect } from "@/lib/slug-redirects";
import { redirect } from "next/navigation";
import ForumDetail from "@/features/forum/components/ForumDetail";

type P = Promise<{ slug: string }>;

export const dynamicParams = true;
export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: P }) {
  const { slug } = await params;
  const dbItem = await getDbPost("forum", slug);
  if (!dbItem) {
    const target = await getSlugRedirect("forum", slug);
    if (target) redirect(`/${target.targetModule}/${target.targetSlug}`);
  }
  return <ForumDetail slug={slug} initialItem={dbItem} />;
}

export async function generateMetadata({ params }: { params: P }) {
  const { slug } = await params;
  const item = await getDbPost("forum", slug);
  return detailMetadata("forum", item, "موضوع انجمن | تکباکس");
}
