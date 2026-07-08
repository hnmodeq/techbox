import { modulePageMetadata } from "@/lib/seo";
import ReviewGrid from "@/features/review/components/ReviewGrid";
export const metadata = modulePageMetadata("review", "نقد و بررسی تخصصی تجهیزات شبکه، سرور، ذخیره‌سازی، امنیت و زیرساخت.");
export default function ReviewPage(){ return <ReviewGrid />; }
