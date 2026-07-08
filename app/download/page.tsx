import { modulePageMetadata } from "@/lib/seo";
import DownloadTable from "@/features/download/components/DownloadTable";
import { getDbModulePosts } from "@/lib/server-posts";

export const metadata = modulePageMetadata(
  "download",
  "مرکز دانلود تکباکس برای فایل‌ها، PDFها، آرشیوها، ابزارها، فریم‌ورها و منابع فنی."
);

export const revalidate = 60;

export default async function DownloadPage() {
  const dbItems = await getDbModulePosts("download", 60);
  return <DownloadTable serverItems={dbItems.length > 0 ? dbItems : undefined} />;
}
