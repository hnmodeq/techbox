import { describe, expect, it } from "vitest";
import {
  COLORABLE_MODULE_SLUGS,
  MODULE_COLOR_DEFAULTS,
  isModuleColor,
  resolveModuleColor,
} from "@/config/module-colors";

describe("module colour system", () => {
  it("provides an accessible visual-picker default for every configurable module", () => {
    expect(COLORABLE_MODULE_SLUGS).toHaveLength(9);
    for (const slug of COLORABLE_MODULE_SLUGS) {
      expect(MODULE_COLOR_DEFAULTS[slug]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("accepts only native-picker hex output and safely falls back", () => {
    expect(isModuleColor("#1d4ed8")).toBe(true);
    expect(isModuleColor("#fff")).toBe(true);
    expect(isModuleColor("oklch(0.7 0.17 52)")).toBe(false);
    expect(isModuleColor("url(javascript:alert(1))")).toBe(false);
    expect(resolveModuleColor("blog", "#abcdef")).toBe("#abcdef");
    expect(resolveModuleColor("blog", "invalid")).toBe(MODULE_COLOR_DEFAULTS.blog);
  });
});
