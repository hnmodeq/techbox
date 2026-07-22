import { modulePageMetadata } from "@/lib/seo";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import MediaGallery from "@/features/media/components/MediaGallery";
import { getDbModulePosts } from "@/lib/server-posts";

export const metadata = modulePageMetadata(
  "media",
  "ویدیوهای آموزشی و عملی تکباکس درباره شبکه، سرور، ذخیره‌سازی و امنیت."
);
export default async function MediaPage() {
  const dbItems = await getDbModulePosts("media", 80);
  return (
    <div dir="rtl">
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <PageBreadcrumb items={[{ label: "خانه", href: "/" }, { label: "رسانه" }]} />
      </div>
      <MediaGallery serverItems={dbItems.length > 0 ? dbItems : undefined} />
    </div>
  );
}
