import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("جستجو | تکباکس", "نتایج جستجوی داخلی تکباکس");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
