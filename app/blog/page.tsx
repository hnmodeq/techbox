import { modulePageMetadata } from "@/lib/seo";
import BlogGrid from "@/features/blog/components/BlogGrid";
export const metadata = modulePageMetadata("blog", "مقالات تخصصی زیرساخت، شبکه، امنیت، ذخیره‌سازی و تجربه‌های اجرایی تیم تکباکس.");
export default function BlogPage(){ return <BlogGrid />; }
