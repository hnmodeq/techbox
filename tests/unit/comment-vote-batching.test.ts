import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (p: string) => fs.readFileSync(path.resolve(__dirname, "../..", p), "utf8");
const client = read("components/ui/like-button.tsx");
const route = read("app/api/comments/vote/route.ts");
const image = read("components/ui/remote-image.tsx");

describe("comment vote lookups are batched", () => {
  it("does not fetch per comment on mount", () => {
    // A 20-comment thread fired 20 requests, each doing a session lookup
    // plus two queries — 60 queries for one page, 2-3s apiece in the logs,
    // and a reliable P2024 on a small pool.
    expect(client).toMatch(/queueVoteFetch\(id,/);
    expect(client).not.toMatch(/fetch\(`\/api\/comments\/vote\?commentId=\$\{encodeURIComponent\(id\)\}`/);
  });

  it("coalesces into one request and dedupes ids", () => {
    expect(client).toMatch(/new Set\(batch\.map\(\(entry\) => entry\.id\)\)/);
    expect(client).toMatch(/commentIds=\$\{encodeURIComponent\(ids\.join\(","\)\)\}/);
  });

  it("resolves every waiter on failure rather than hanging", () => {
    // A rejected batch must not leave components waiting forever.
    expect(client).toMatch(/for \(const entry of batch\) entry\.resolve\(null\)/);
  });

  it("serves the bulk form with two queries regardless of comment count", () => {
    expect(route).toMatch(/searchParams\.get\("commentIds"\)/);
    expect(route).toMatch(/Promise\.all/);
    expect(route).toMatch(/commentId: \{ in: ids \}/);
    // Bounded, so a crafted URL cannot request unlimited rows.
    expect(route).toMatch(/\.slice\(0, 100\)/);
  });
});

describe("images can bypass the server-side optimizer", () => {
  it("supports an unoptimized escape hatch", () => {
    // Next's optimizer fetches from Node using the OS resolver. Where an
    // ISP poisons DNS (Iranian networks return 10.10.34.x for blocked
    // hosts) Next rejects the private IP and every image 502s, even though
    // the browser — which uses DNS-over-HTTPS — loads the same URL fine.
    expect(image).toMatch(/NEXT_PUBLIC_UNOPTIMIZED_IMAGES/);
    expect(image).toMatch(/unoptimized=\{UNOPTIMIZED\}/);
  });

  it("stays optimized unless explicitly disabled", () => {
    // Must be opt-in: production should keep AVIF/WebP.
    expect(image).toMatch(/=== "1"/);
  });
});
