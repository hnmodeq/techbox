import { modulePageMetadata } from "@/lib/seo";
import NewsList from "@/features/news/components/NewsList";
export const metadata = modulePageMetadata("news", "آخرین خبرهای فناوری اطلاعات، زیرساخت، امنیت، شبکه و سخت‌افزار از نگاه تکباکس.");
export default function NewsPage(){ return <NewsList />; }
