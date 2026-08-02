import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const doctor = fs.readFileSync(
  path.resolve(__dirname, "../..", "scripts/checks/db-connect.ts"),
  "utf8",
);

describe("database doctor Prisma probe", () => {
  it("uses one isolated connection rather than Prisma's hardware-derived default pool", () => {
    expect(doctor).toMatch(/function doctorPrismaUrl/);
    expect(doctor).toMatch(/searchParams\.set\("connection_limit", "1"\)/);
    expect(doctor).toMatch(/searchParams\.set\("pool_timeout", "15"\)/);
    expect(doctor).toMatch(/datasources: \{ db: \{ url: doctorPrismaUrl\(dbUrl\) \} \}/);
    expect(doctor).toMatch(/probe pool  1 connection/);
  });

  it("keeps its own count probes serial and always disconnects", () => {
    expect(doctor).toMatch(/const posts = await client\.post\.count\(\)/);
    expect(doctor).toMatch(/const users = await client\.user\.count\(\)/);
    expect(doctor).not.toMatch(/Promise\.all\(\[client\.post\.count/);
    expect(doctor).toMatch(/finally \{\s*await doctorClient\?\.\$disconnect/);
  });
});
