import { describe, expect, it } from "vitest";
import { hasPermission } from "@/lib/permissions";
import { deriveModulesFromPermissions } from "@/lib/user-permissions";

describe("RBAC permission matching", () => {
  it("supports exact and scoped wildcard grants", () => {
    expect(hasPermission(["content:blog:edit"], "content:blog:edit")).toBe(true);
    expect(hasPermission(["content:*:view"], "content:news:view")).toBe(true);
    expect(hasPermission(["content:blog:view"], "content:*:view")).toBe(true);
    expect(hasPermission(["*"], "order:status:edit")).toBe(true);
    expect(hasPermission(["content:blog:view"], "content:news:view")).toBe(false);
  });

  it("derives client module visibility from permissions, not User.modules", () => {
    expect(deriveModulesFromPermissions("editor", ["content:news:edit", "product:list:view"]))
      .toEqual(expect.arrayContaining(["news", "shop"]));
    expect(deriveModulesFromPermissions("editor", ["order:list:view"])).toEqual([]);
  });
});
