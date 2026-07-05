"use client";

import users from "@/prisma/mock-data/users.json";

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
};

const KEY = "tb_auth_user";

export function login(username: string): AppUser | null {
  const u = (users as AppUser[]).find(x => x.username === username.toLowerCase());
  if (u && typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(u));
    window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
    return u;
  }
  return null;
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

export const allUsers = users as AppUser[];
