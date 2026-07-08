import { modulePageMetadata } from "@/lib/seo";
import NewsList from "@/features/news/components/NewsList";
import { getDbModulePosts } from "@/lib/server-posts";

export const metadata = modulePageMetadata(
  "news",
  "آخرین خبرهای فناوری اطلاعات، زیرساخت، امنیت، شبکه و سخت‌افزار از نگاه تکباکس."
);

export const revalidate = 60;

export default async function NewsPage() {
  const dbItems = await getDbModulePosts("news", 100);
  return <NewsList serverItems={dbItems.length > 0 ? dbItems : undefined} />;
}
