import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.resolve(__dirname, "../../scripts/checks/storage.ts"), "utf8");

describe("storage integrity check resilience", () => {
  it("retries provider throttling and does not misreport a 429 as a missing object", () => {
    expect(source).toMatch(/attempt < 4/);
    expect(source).toMatch(/\[429, 502, 503, 504\]/);
    expect(source).toMatch(/transient provider response after retries/);
    expect(source).toMatch(/retired \|\| transient \? 'warning' : 'error'/);
  });

  it("uses one ranged request rather than HEAD followed by GET", () => {
    expect(source).toMatch(/Range: 'bytes=0-0'/);
    expect(source).not.toMatch(/method: 'HEAD'/);
  });
});
