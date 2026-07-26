import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Egress guards.
 *
 * The Neon/Supabase free tier meters 5 GB/month of network transfer, and
 * this project came within 8% of that ceiling. The cause was not traffic
 * volume — it was selecting columns nobody rendered. A single QNAP `specs`
 * JSON blob is 40 kB, and 16 of the 30 rows in the ticker window carried
 * one, so the ticker query alone moved 361 kB per homepage render to
 * display a title and a date.
 *
 * These tests fail loudly if that regresses, because the symptom (a quota
 * bar creeping up over weeks) is invisible in code review and impossible
 * to attribute after the fact.
 */

const homeServer = fs.readFileSync(
  path.resolve(__dirname, "../../lib/home-server.ts"),
  "utf8"
);

/** Extract a `const NAME = { ... } as const;` block by brace matching. */
function selectBlock(name: string): string {
  const start = homeServer.indexOf(`const ${name} = {`);
  expect(start, `${name} not found in lib/home-server.ts`).toBeGreaterThan(-1);
  let depth = 0;
  for (let i = homeServer.indexOf("{", start); i < homeServer.length; i++) {
    if (homeServer[i] === "{") depth++;
    else if (homeServer[i] === "}") {
      depth--;
      if (depth === 0) return homeServer.slice(start, i + 1);
    }
  }
  throw new Error(`unterminated ${name}`);
}

describe("cardSelect stays lean", () => {
  const block = selectBlock("cardSelect");

  it("does not fetch `specs`", () => {
    // The single most expensive column on the homepage: up to 40 kB per
    // shop row, and normalizeCard() never emitted it.
    expect(block).not.toMatch(/\bspecs:\s*true/);
  });

  it("does not fetch columns normalizeCard drops on the floor", () => {
    // Selected and then silently discarded. Pure transfer cost.
    for (const field of ["warranty", "reviewedProductId"]) {
      expect(block, `${field} is fetched but never emitted`).not.toMatch(
        new RegExp(`\\b${field}:\\s*true`)
      );
    }
  });

  it("still fetches what cards actually render", () => {
    // Guard against over-trimming: these are read downstream.
    for (const field of ["title", "slug", "image", "excerpt", "content", "priceAmount"]) {
      expect(block, `${field} is required by a card`).toMatch(
        new RegExp(`\\b${field}:\\s*true`)
      );
    }
  });
});

describe("tickerSelect stays minimal", () => {
  const block = selectBlock("tickerSelect");

  it("fetches only the five fields NewsTicker reads", () => {
    const fields = [...block.matchAll(/^\s*(\w+):\s*true,?$/gm)].map((m) => m[1]);
    expect(fields.sort()).toEqual(["date", "id", "module", "slug", "title"]);
  });

  it("never pulls heavy columns", () => {
    // The ticker renders a title and a relative date. Nothing else is
    // justifiable at 30 rows on every single route.
    for (const field of ["specs", "content", "gallery", "excerpt", "author"]) {
      expect(block, `ticker must not fetch ${field}`).not.toMatch(
        new RegExp(`\\b${field}:`)
      );
    }
  });
});

describe("ticker rows are normalized by their own function", () => {
  it("uses normalizeTickerCard, not normalizeCard", () => {
    // Passing a trimmed row through normalizeCard would spread `undefined`
    // across ~30 keys, and consumers distinguish absent from empty.
    const tickerAssignments = [...homeServer.matchAll(/ticker[A-Za-z]*\.map\((\w+)\)/g)].map(
      (m) => m[1]
    );
    expect(tickerAssignments.length).toBeGreaterThan(0);
    for (const fn of tickerAssignments) {
      expect(fn).toBe("normalizeTickerCard");
    }
  });

  it("supplies every field ContentItem requires", () => {
    // tsc enforces this too, but a plain assertion documents *why* the
    // defaults exist rather than leaving them looking arbitrary.
    const start = homeServer.indexOf("function normalizeTickerCard");
    const body = homeServer.slice(start, homeServer.indexOf("\n}", start));
    for (const field of ["id", "slug", "module", "title", "date", "tags", "author"]) {
      expect(body, `normalizeTickerCard must set ${field}`).toMatch(
        new RegExp(`\\b${field}:`)
      );
    }
  });
});

/**
 * Unbounded admin routes.
 *
 * These query every row in a table with no pagination, so a Prisma
 * `include` (which selects all columns) scales with the whole database.
 * /api/admin/content-health transferred 1598 kB for 164 posts, 1228 kB of
 * it the `specs` column that nothing in the handler reads.
 */
describe("unbounded admin routes use explicit selects", () => {
  const read = (p: string) =>
    fs.readFileSync(path.resolve(__dirname, "../..", p), "utf8");

  it("content-health does not use a bare include", () => {
    const src = read("app/api/admin/content-health/route.ts");
    expect(src).toMatch(/prisma\.post\.findMany\(\{[\s\S]{0,200}select:/);
    expect(src).not.toMatch(/prisma\.post\.findMany\(\{\s*orderBy:[^}]*\}\s*,\s*include:/);
  });

  it("the admin user list never pulls password hashes", () => {
    // publicUser() strips the password from the response, but `include`
    // still moves every bcrypt hash out of the database first.
    const src = read("app/api/admin/users/route.ts");
    const listQuery = src.slice(src.indexOf("const users = await prisma.user.findMany"));
    expect(listQuery).toMatch(/select:/);
    expect(listQuery.slice(0, 800)).not.toMatch(/password:\s*true/);
  });
});
