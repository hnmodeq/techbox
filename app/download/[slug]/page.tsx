import { getDbPost } from "@/lib/server-post";
import { getSlugRedirect } from "@/lib/slug-redirects";
import { redirect } from "next/navigation";
import DbDownloadDetail from "@/features/download/components/DbDownloadDetail";

export const dynamicParams = true;
export const dynamic = "force-dynamic";

type P = Promise<{ slug: string }>;

export default async function Page({ params }: { params: P }) {
  const { slug } = await params;
  const dbItem = await getDbPost("download", slug);
  if (!dbItem) {
    const target = await getSlugRedirect("download", slug);
    if (target) redirect(`/${target.targetModule}/${target.targetSlug}`);
  }
  return <DbDownloadDetail slug={slug} fallback={null} />;
}

export async function generateMetadata({ params }: { params: P }) {
  const { slug } = await params;
  const item = await getDbPost("download", slug);
  return { title: item ? `${item.title} | دانلود تکباکس` : "دانلود تکباکس" };
}
