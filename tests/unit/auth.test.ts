import { describe, expect, it } from "vitest";
import { canEdit, canView, type AppUser } from "@/lib/auth";

const sara = {
  id: "1",
  role: "editor",
  modules: [],
  permissions: ["content:blog:view", "content:blog:edit"],
  name: "Sara",
  username: "sara",
  email: "sara@test.com",
  avatar: "",
} satisfies AppUser;

const admin = {
  id: "2",
  role: "super_admin",
  modules: [],
  permissions: ["*"],
  name: "Admin",
  username: "admin",
  email: "admin@test.com",
  avatar: "",
} satisfies AppUser;

describe("permission-backed client authorization", () => {
  it("allows a module granted by effective permissions", () => {
    expect(canView(sara, "blog")).toBe(true);
    expect(canEdit(sara, "blog")).toBe(true);
  });

  it("denies a module without a matching permission", () => {
    expect(canEdit(sara, "news")).toBe(false);
  });

  it("does not treat the legacy modules array as authority", () => {
    const legacyOnly = { ...sara, permissions: [], modules: ["news"] };
    expect(canView(legacyOnly, "news")).toBe(false);
    expect(canEdit(legacyOnly, "news")).toBe(false);
  });

  it("allows super administrators and denies anonymous users", () => {
    expect(canEdit(admin, "shop")).toBe(true);
    expect(canEdit(null, "blog")).toBe(false);
  });
});
