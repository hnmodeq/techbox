"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/** Compatibility bridge for existing like/comment/register buttons. The modal
 * has been removed: every role now uses the canonical full-page auth flow. */
export function AuthModal() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const openLoginPage = (event: Event) => {
      const requested = (event as CustomEvent<{ mode?: "login" | "register" }>).detail?.mode;
      const params = new URLSearchParams();
      if (requested === "register") params.set("mode", "register");
      if (pathname && pathname !== "/login") params.set("redirect", pathname);
      router.push(`/login${params.size ? `?${params.toString()}` : ""}`);
    };
    window.addEventListener("tb_open_auth", openLoginPage);
    return () => window.removeEventListener("tb_open_auth", openLoginPage);
  }, [pathname, router]);

  return null;
}

export default AuthModal;
