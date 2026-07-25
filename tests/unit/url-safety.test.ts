import { describe, expect, it } from "vitest";
import { isSafeRemoteUrl } from "@/lib/url-safety";

describe("server-side remote URL validation", () => {
  it.each([
    "https://localhost/file",
    "https://127.0.0.1/file",
    "https://10.0.0.1/file",
    "https://192.168.1.10/file",
    "https://172.16.0.1/file",
    "https://169.254.169.254/latest/meta-data",
    "file:///etc/passwd",
    "javascript:alert(1)",
    "https://user:password@example.com/file",
  ])("rejects %s", (url) => {
    expect(isSafeRemoteUrl(url)).toBe(false);
  });

  it("requires HTTPS unless HTTP is explicitly allowed", () => {
    expect(isSafeRemoteUrl("http://example.com/file")).toBe(false);
    expect(isSafeRemoteUrl("http://example.com/file", { allowHttp: true })).toBe(true);
  });

  it("enforces an exact host allowlist", () => {
    expect(isSafeRemoteUrl("https://project.supabase.co/file", { allowHosts: ["project.supabase.co"] })).toBe(true);
    expect(isSafeRemoteUrl("https://evil.example/file", { allowHosts: ["project.supabase.co"] })).toBe(false);
  });
});
