import { modulePageMetadata } from "@/lib/seo";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import BlogMagazineGrid from "@/features/blog/components/BlogMagazineGrid";
import { getDbModulePosts } from "@/lib/server-posts";

export const metadata = modulePageMetadata(
  "blog",
  "مقالات تخصصی زیرساخت، شبکه، امنیت، ذخیره‌سازی و تجربه‌های اجرایی تیم تکباکس."
);

export default async function BlogPage() {
  const dbItems = await getDbModulePosts("blog", 100);

  return (
    <main dir="rtl">
      <div className="mx-auto max-w-7xl px-4 pt-6">
        <PageBreadcrumb items={[{ label: "خانه", href: "/" }, { label: "مجله آنلاین" }]} />
      </div>
      <BlogMagazineGrid serverItems={dbItems.length > 0 ? dbItems : undefined} />
    </main>
  );
}
