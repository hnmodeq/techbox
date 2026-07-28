import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const css = fs.readFileSync(
  path.resolve(__dirname, "../..", "design/globals.css"),
  "utf8",
);

/**
 * Tailwind's class scanner is deliberately naive: any `word:word` token in a
 * scanned file is treated as a possible arbitrary-property utility. Server
 * code is full of such tokens in log tags and permission strings —
 * console.error("[zarinpal:request]"), "user-roles:assign" — and Tailwind
 * emitted real rules for them:
 *
 *     .\[zarinpal\:request\] { zarinpal: request; }
 *
 * That is invalid CSS no element ever uses, and every one logged an
 * "Unknown property" error in the browser console on each page load.
 */
describe("Tailwind scanner scope", () => {
  it("excludes directories that cannot contain a className", () => {
    for (const dir of ["../app/api", "../lib", "../scripts", "../prisma", "../tests"]) {
      expect(css).toContain(`@source not "${dir}"`);
    }
  });

  it("still scans the directories that DO hold markup", () => {
    // A blanket exclusion would silently drop real utilities. These must
    // never appear in an exclusion rule.
    for (const dir of ["../app", "../components", "../features", "../providers"]) {
      expect(css).not.toMatch(
        new RegExp(`@source not "${dir.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"\\s*;`),
      );
    }
  });
});
