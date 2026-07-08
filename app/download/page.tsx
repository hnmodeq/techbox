import { modulePageMetadata } from "@/lib/seo";
import DownloadTable from "@/features/download/components/DownloadTable";
export const metadata = modulePageMetadata("download", "مرکز دانلود تکباکس برای فایل‌ها، PDFها، آرشیوها، ابزارها، فریم‌ورها و منابع فنی.");
export default function DownloadPage(){ return <DownloadTable />; }
