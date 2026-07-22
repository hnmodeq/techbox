import { modulePageMetadata } from "@/lib/seo";
import MediaGallery from "@/features/media/components/MediaGallery";
import { getDbModulePosts } from "@/lib/server-posts";

export const metadata = modulePageMetadata(
  "media",
  "ویدیوهای آموزشی و عملی تکباکس درباره شبکه، سرور، ذخیره‌سازی و امنیت."
);
export default async function MediaPage() {
  const dbItems = await getDbModulePosts("media", 80);
  return <MediaGallery serverItems={dbItems.length > 0 ? dbItems : undefined} />;
}
