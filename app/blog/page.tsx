import { modulePageMetadata } from "@/lib/seo";
import BlogGrid from "@/features/blog/components/BlogGrid";
import { getDbModulePosts } from "@/lib/server-posts";

export const metadata = modulePageMetadata(
  "blog",
  "مقالات تخصصی زیرساخت، شبکه، امنیت، ذخیره‌سازی و تجربه‌های اجرایی تیم تکباکس."
);

export const revalidate = 60;

export default async function BlogPage() {
  const dbItems = await getDbModulePosts("blog", 100);
  return <BlogGrid serverItems={dbItems.length > 0 ? dbItems : undefined} />;
}
