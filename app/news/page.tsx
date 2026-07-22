import { modulePageMetadata } from "@/lib/seo";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import NewsList from "@/features/news/components/NewsList";
import { getDbModulePosts } from "@/lib/server-posts";

export const metadata = modulePageMetadata(
  "news",
  "آخرین خبرهای فناوری اطلاعات، زیرساخت، امنیت، شبکه و سخت‌افزار از نگاه تکباکس."
);
export default async function NewsPage() {
  const dbItems = await getDbModulePosts("news", 100);
  return (
    <div dir="rtl">
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <PageBreadcrumb items={[{ label: "خانه", href: "/" }, { label: "اخبار" }]} />
      </div>
      <NewsList serverItems={dbItems.length > 0 ? dbItems : undefined} />
    </div>
  );
}
