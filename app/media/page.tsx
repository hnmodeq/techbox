import { modulePageMetadata } from "@/lib/seo";
import MediaReels from "@/features/media/components/MediaReels";
import { getDbModulePosts } from "@/lib/server-posts";

export const metadata = modulePageMetadata(
  "media",
  "ویدیوهای آموزشی و عملی تکباکس درباره شبکه، سرور، ذخیره‌سازی و امنیت."
);
export default async function MediaPage() {
  const dbItems = await getDbModulePosts("media", 80);
  return (
    <main className="w-full" dir="rtl">
      <MediaReels serverItems={dbItems.length > 0 ? dbItems : undefined} />
    </main>
  );
}
