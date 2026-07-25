import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function createSupportAccessToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSupportAccessToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function verifySupportAccessToken(token: string | null | undefined, expectedHash: string | null) {
  if (!token || !expectedHash) return false;
  const actual = Buffer.from(hashSupportAccessToken(token), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
