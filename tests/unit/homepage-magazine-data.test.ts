import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (p: string) => fs.readFileSync(path.resolve(__dirname, "../..", p), "utf8");

/**
 * The homepage Magazine has a deliberately different freshness contract from
 * the other cached sections: latest article first, then a fresh random sample
 * of four real article rows on every full page refresh.
 *
 * These source-level checks protect that wiring without requiring a live
 * production database in the unit-test environment.
 */
describe("homepage magazine data contract", () => {
  const homeServer = read("lib/home-server.ts");
  const page = read("app/page.tsx");
  const tagListing = read("components/seo/ModuleListingPage.tsx");

  it("selects the newest published blog row as the lead", () => {
    expect(homeServer).toMatch(/export async function getMagazinePosts/);
    expect(homeServer).toMatch(/module: "blog"/);
    expect(homeServer).toMatch(/published: true/);
    expect(homeServer).toMatch(/deletedAt: null/);
    expect(homeServer).toMatch(/date: publicPostDateWhere\(\)/);
    expect(homeServer).toMatch(/orderBy: \[\{ date: "desc" \}, \{ id: "desc" \}\]/);
  });

  it("samples four distinct database candidates without fake content", () => {
    // The candidate query transfers IDs only; selected cards then receive
    // the normal card select, which carries real tags, dates and content.
    expect(homeServer).toMatch(/orderBy: \[\{ date: "desc" \}, \{ id: "desc" \}\]/);
    expect(homeServer).toMatch(/take: 8,/);
    expect(homeServer).toMatch(/select: \{ id: true \}/);
    expect(homeServer).toMatch(/randomSample\(candidateIds\.map\(\(post\) => post\.id\), 4\)/);
    expect(homeServer).toMatch(/where: \{ id: \{ in: selectedIds \} \}/);
    expect(homeServer).toMatch(/select: cardSelect/);
    expect(homeServer).toMatch(/import \{ randomInt \} from "node:crypto"/);
    const randomSample = homeServer.slice(homeServer.indexOf("function randomSample"), homeServer.indexOf("export async function getMagazinePosts"));
    expect(randomSample).toMatch(/randomInt\(sampled\.length - index\)/);
    expect(randomSample).not.toMatch(/Math\.random\(/);
  });

  it("keeps the random selection server-rendered, refreshed hourly", () => {
    // Was `dynamic = "force-dynamic"`, which re-queried on every single
    // visit. On a free Neon tier transfer and compute are monthly quotas,
    // so the rail now rotates once an hour via the route cache and the
    // matching unstable_cache window on getMagazinePosts. Still server
    // rendered, still real rows — just not per-request.
    expect(page).toMatch(/export const revalidate = 3600/);
    expect(page).not.toMatch(/force-dynamic/);
    expect(homeServer).toMatch(/cachedMagazinePosts = unstable_cache/);
    expect(homeServer).toMatch(/revalidate: 3600/);
    expect(page).toMatch(/await getMagazinePosts\(\)/);
    expect(page).toMatch(/<MagazineSection posts=\{magazinePosts\}/);
  });

  it("returns exact database tag matches from the Magazine tag destination", () => {
    // PostgreSQL JSONB containment for a tag array must receive [value], not
    // the scalar value; otherwise a clicked tag can produce an empty result.
    expect(tagListing).toMatch(/where\.tags = \{ array_contains: \[value\] \}/);
  });
});
