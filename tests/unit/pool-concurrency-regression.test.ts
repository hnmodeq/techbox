import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.resolve(__dirname, "../..", file), "utf8");

describe("local connection-pool pressure controls", () => {
  it("deduplicates concurrent permission-session lookups", () => {
    const auth = read("lib/auth-server.ts");
    const permissions = read("lib/api-permissions.ts");
    expect(auth).toMatch(/getPublicUserShared/);
    expect(auth).toMatch(/__publicSessionLookups/);
    expect(permissions).toMatch(/getSessionUserPublicStrict/);
    expect(permissions).toMatch(/auth_temporarily_unavailable/);
  });

  it("does not write the timeline system event during GET", () => {
    const route = read("app/api/timeline/suggestions/route.ts");
    const getBlock = route.slice(route.indexOf("export async function GET"), route.indexOf("export async function POST"));
    expect(getBlock).not.toMatch(/ensureSuggestionsEvent\(\)|timelineEvent\.upsert/);
    expect(getBlock).toMatch(/timelineComment\.findMany/);
  });

  it("derives latest post dates from the dashboard aggregate without fan-out", () => {
    const route = read("app/api/admin/dashboard/route.ts");
    expect(route).toMatch(/_max: \{ date: true \}/);
    expect(route).not.toMatch(/postModules\.map\(async|const latestRows/);
  });

  it("reuses server-rendered shop data and shares Strict Mode GETs", () => {
    const posts = read("hooks/useDbPosts.ts");
    const footer = read("components/layout/Footer.tsx");
    const timeline = read("providers/timeline-likes.provider.tsx");
    expect(posts).toMatch(/serverFallback\.length > 0/);
    expect(footer).toMatch(/sharedJsonRequest/);
    expect(timeline).toMatch(/sharedJsonRequest/);
  });

  it("gives the single local dev process enough bounded pool headroom", () => {
    const db = read("lib/db.ts");
    expect(db).toMatch(/const fallbackLimit = isDev \? 8 : 1/);
    expect(db).toMatch(/configuredLimit > 0 && configuredLimit <= 10/);
    expect(db).toMatch(/fallbackPoolTimeout = isDev \? 30 : 15/);
  });

  it("reuses production clients and retries primary reads once through a fresh pool", () => {
    const db = read("lib/db.ts");
    const login = read("app/api/auth/login/route.ts");
    const register = read("app/api/auth/register/route.ts");
    const modulePosts = read("lib/server-posts.ts");
    expect(db).toMatch(/globalForPrisma\.prisma = client/);
    expect(db).toMatch(/resetPrismaPool/);
    expect(db).toMatch(/expectedGeneration/);
    expect(db).toMatch(/withFreshPrismaRetry/);
    expect(login).toMatch(/withFreshPrismaRetry/);
    expect(register).toMatch(/withFreshPrismaRetry/);
    expect(modulePosts).toMatch(/withFreshPrismaRetry/);
    expect(login).toMatch(/database_temporarily_unavailable/);
  });

  it("keeps one stable authentication boundary above every layout branch", () => {
    const root = read("app/layout.tsx");
    const shell = read("components/layout/LayoutShell.tsx");
    expect(root).toMatch(/<AuthProvider>[\s\S]*<LayoutShell/);
    expect(shell).not.toMatch(/<AuthProvider>/);
  });
});
