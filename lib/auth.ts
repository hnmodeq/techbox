"use client";

// Client-side authentication types
export type AppUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  modules: string[];
  avatar?: string;
  roleFa?: string;
  job?: string;
  bio?: string;
  verifiedType?: string | null;
  verifiedLabel?: string | null;
};

const KEY = "tb_auth_user";

// Client-side login cache mechanism (only used to sync state across tabs instantly after successful server login)
export function login(user: AppUser): AppUser {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(user));
    window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
  }
  return user;
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
  }
}

export function getCurrentUserClient(): AppUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function canEdit(user: AppUser | null, module: string) {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  return user.modules.includes(module);
}
