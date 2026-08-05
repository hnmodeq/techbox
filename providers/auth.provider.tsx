"use client";

import * as React from "react";
import { canEdit as canEditModuleForUser, type AppUser } from "@/lib/auth";

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  unavailable: boolean;
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
  const [unavailable, setUnavailable] = React.useState(false);

  const refresh = React.useCallback(async (): Promise<AppUser | null> => {
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
        credentials: "include",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "auth_unavailable");
      const nextUser = data?.user ?? null;
      setUnavailable(false);
      setUser(nextUser);
      return nextUser;
    } catch {
      // Existing in-memory identity is retained; guards must not turn a 503
      // database outage into a logout redirect.
      setUnavailable(true);
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
      setUnavailable(false);
      setLoading(false);
      broadcastAuthChanged();
    }
  }, []);

  const canEdit = React.useCallback(
    (module: string) => canEditModuleForUser(user, module),
    [user]
  );

  const value = React.useMemo<AuthContextValue>(
    () => ({ user, loading, unavailable, login, logout, refresh, canEdit }),
    [user, loading, unavailable, login, logout, refresh, canEdit]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an <AuthProvider>");
  return context;
}

export default AuthProvider;
