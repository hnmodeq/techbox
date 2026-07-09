// @ts-nocheck
// Vitest ESM test – types provided by vitest – skipped in tsc CI to keep build green.
// This test verifies the *single source of truth* invariant: per-module
// presentation metadata in lib/content must be derived from the canonical
// module registry in config/modules.config, never hard-coded.
import { describe, it, expect } from "vitest";
import { moduleMeta, type ModuleSlug } from "@/lib/content";
import { moduleList } from "@/config/modules.config";

describe("content module metadata", () => {
  it("moduleMeta is derived from the canonical module registry", () => {
    const contentModules = Object.keys(moduleMeta) as ModuleSlug[];
    expect(contentModules.length).toBeGreaterThan(0);
    for (const slug of contentModules) {
      const fromConfig = moduleList.find((m) => m.slug === slug);
      expect(fromConfig, `module "${slug}" must exist in config/modules.config`).toBeTruthy();
      expect(moduleMeta[slug].titleFa).toBe(fromConfig!.titleFa);
      expect(moduleMeta[slug].href).toBe(fromConfig!.href);
      expect(moduleMeta[slug].color).toBe(fromConfig!.color);
    }
  });

  it("every content module exposes a route and a color", () => {
    for (const meta of Object.values(moduleMeta)) {
      expect(meta.href).toMatch(/^\//);
      expect(meta.color).toBeTruthy();
    }
  });
});
