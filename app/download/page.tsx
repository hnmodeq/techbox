import { modulePageMetadata } from "@/lib/seo";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import DownloadTable from "@/features/download/components/DownloadTable";
import { getDbModulePosts } from "@/lib/server-posts";

export const metadata = modulePageMetadata(
  "download",
  "مرکز دانلود تکباکس برای فایل‌ها، PDFها، آرشیوها، ابزارها، فریم‌ورها و منابع فنی."
);
export default async function DownloadPage() {
  const dbItems = await getDbModulePosts("download", 60);
  return (
    <div dir="rtl">
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <PageBreadcrumb items={[{ label: "خانه", href: "/" }, { label: "دانلود" }]} />
      </div>
      <DownloadTable serverItems={dbItems.length > 0 ? dbItems : undefined} />
    </div>
  );
}
