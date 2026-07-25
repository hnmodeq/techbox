"use client";

import * as React from "react";
import { canEdit as canEditModuleForUser, type AppUser } from "@/lib/auth";

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  login: () => Promise<AppUser | null>;
  logout: () => Promise<void>;
  refresh: () => Promise<AppUser | null>;
  canEdit: (module: string) => boolean;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);
const AUTH_CHANNEL = "techbox-auth";

function broadcastAuthChanged() {
  if (typeof BroadcastChannel === "undefined") return;
  const channel = new BroadcastChannel(AUTH_CHANNEL);
  channel.postMessage("refresh");
  channel.close();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AppUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async (): Promise<AppUser | null> => {
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
        credentials: "include",
      });
      const data = await response.json().catch(() => ({}));
      const nextUser = response.ok ? (data?.user ?? null) : null;
      setUser(nextUser);
      return nextUser;
    } catch {
      // Do not invent or restore a browser-cached identity on network failure.
      // Existing in-memory state is retained for transient failures.
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  React.useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(AUTH_CHANNEL);
    channel.onmessage = () => void refresh();
    return () => channel.close();
  }, [refresh]);

  const login = React.useCallback(async () => {
    const nextUser = await refresh();
    broadcastAuthChanged();
    return nextUser;
  }, [refresh]);

  const logout = React.useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      setUser(null);
      setLoading(false);
      broadcastAuthChanged();
    }
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
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an <AuthProvider>");
  return context;
}

export default AuthProvider;
