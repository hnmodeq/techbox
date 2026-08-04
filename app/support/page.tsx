import { redirect } from "next/navigation";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "مشاوره | تکباکس",
  description: "این نشانی به سامانه مشاوره تکباکس منتقل شده است.",
  path: "/support",
  noIndex: true,
});

export default function LegacySupportPage() {
  redirect("/consultation");
}
