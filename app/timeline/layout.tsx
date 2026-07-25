import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "گاه‌شمار فناوری | تکباکس",
  description: "گاه‌شمار جامع رویدادها و نقاط عطف مهم فناوری اطلاعات از گذشته تا امروز.",
  path: "/timeline",
});

export default function TimelineLayout({ children }: { children: React.ReactNode }) {
  return children;
}
