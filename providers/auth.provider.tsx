"use client";

import * as React from "react";
import {
  getCurrentUserClient,
  login as persistLogin,
  logout as persistLogout,
  canEdit as canEditModuleForUser,
  type AppUser,
} from "@/lib/auth";

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  login: (user: AppUser) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  canEdit: (module: string) => boolean;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AppUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Keep React state in sync with the client-side auth cache (localStorage +
  // cross-tab `storage` events + in-app `tb_auth_changed` events).
  React.useEffect(() => {
    const sync = () => setUser(getCurrentUserClient());
    sync();

    const onCustomAuth = (e: Event) => {
      const detail = (e as CustomEvent<AppUser | null>).detail;
      setUser(detail ?? getCurrentUserClient());
    };
    const onStorage = () => setUser(getCurrentUserClient());

    window.addEventListener("tb_auth_changed", onCustomAuth);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("tb_auth_changed", onCustomAuth);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Verify the session with the server — but only when a local user exists,
  // so anonymous visitors don't pay for an extra request on every page load.
  React.useEffect(() => {
    let active = true;
    const verify = async () => {
      if (!getCurrentUserClient()) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();
        if (active) setUser(data?.user ?? null);
      } catch {
        // Network error: keep the locally cached user.
      } finally {
        if (active) setLoading(false);
      }
    };
    verify();
    return () => {
      active = false;
    };
  }, []);

  const login = React.useCallback((u: AppUser) => {
    persistLogin(u);
    setUser(u);
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    } finally {
      persistLogout();
      setUser(null);
    }
  }, []);

  const refresh = React.useCallback(async () => {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    const data = await res.json();
    setUser(data?.user ?? null);
  }, []);

  const canEdit = React.useCallback(
    (module: string) => canEditModuleForUser(user, module),
    [user]
  );

  const value = React.useMemo<AuthContextValue>(
    () => ({ user, loading, login, logout, refresh, canEdit }),
    [user, loading, login, logout, refresh, canEdit]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}

export default AuthProvider;
