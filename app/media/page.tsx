import { modulePageMetadata } from "@/lib/seo";
import MediaGallery from "@/features/media/components/MediaGallery";
export const metadata = modulePageMetadata("media", "ویدیوهای آموزشی و عملی تکباکس درباره شبکه، سرور، ذخیره‌سازی و امنیت.");
export default function MediaPage(){ return <MediaGallery />; }
