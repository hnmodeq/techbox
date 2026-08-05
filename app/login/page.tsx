import { privatePageMetadata } from "@/lib/seo";
import { UnifiedLoginPage, type AuthPageMode } from "@/features/auth/components/unified-login-page";

export const metadata = privatePageMetadata("ورود و عضویت | تکباکس", "درگاه مشترک ورود کاربران، نویسندگان و مدیران تکباکس");

type Props = {
  searchParams: Promise<{ mode?: string; redirect?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const mode: AuthPageMode = params.mode === "register" ? "register" : "login";
  return <UnifiedLoginPage initialMode={mode} redirectTo={params.redirect} />;
}
