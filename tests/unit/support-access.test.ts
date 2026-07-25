import { describe, expect, it } from "vitest";
import {
  createSupportAccessToken,
  hashSupportAccessToken,
  verifySupportAccessToken,
} from "@/lib/support-access";

describe("support ticket capabilities", () => {
  it("stores a one-way hash and rejects a different token", () => {
    const token = createSupportAccessToken();
    const hash = hashSupportAccessToken(token);
    expect(token.length).toBeGreaterThanOrEqual(40);
    expect(hash).not.toBe(token);
    expect(verifySupportAccessToken(token, hash)).toBe(true);
    expect(verifySupportAccessToken(`${token}x`, hash)).toBe(false);
    expect(verifySupportAccessToken(undefined, hash)).toBe(false);
  });
});
