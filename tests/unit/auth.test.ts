import { describe, it, expect } from "vitest";
import { canEdit } from "@/lib/auth";
import type { AppUser } from "@/lib/auth";

const sara = { id: "1", role: "editor", modules: ["blog"], name: "Sara", username: "sara", email: "sara@test.com", avatar: null } as unknown as AppUser;
const admin = { id: "2", role: "super_admin", modules: [], name: "Admin", username: "admin", email: "admin@test.com", avatar: null } as unknown as AppUser;

describe("rbac", () => {
  it("sara can edit blog", () => {
    expect(canEdit(sara, "blog")).toBe(true);
  });
  it("sara cannot edit news", () => {
    expect(canEdit(sara, "news")).toBe(false);
  });
  it("admin can edit all", () => {
    expect(canEdit(admin, "shop")).toBe(true);
  });
  it("null user cannot edit", () => {
    expect(canEdit(null, "blog")).toBe(false);
  });
});
