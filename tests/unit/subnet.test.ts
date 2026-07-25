import { describe, expect, it } from "vitest";
import {
  calculateSubnet,
  cidrToMask,
  intToIpv4,
  ipv4ToInt,
  isValidIpv4,
} from "@/lib/subnet";

describe("IPv4 validation and conversion", () => {
  const validationCases: Array<[string, boolean]> = [
    ["192.168.1.1", true],
    ["0.0.0.0", true],
    ["255.255.255.255", true],
    ["256.1.1.1", false],
    ["192.168.1", false],
    ["192.168.1.-1", false],
    ["example.com", false],
  ];
  it.each(validationCases)("validates %s", (value, expected) => {
    expect(isValidIpv4(value)).toBe(expected);
  });

  it("round-trips unsigned IPv4 integers", () => {
    for (const address of ["0.0.0.0", "10.20.30.40", "192.168.1.1", "255.255.255.255"]) {
      expect(intToIpv4(ipv4ToInt(address))).toBe(address);
    }
  });
});

describe("CIDR subnet calculation", () => {
  it("calculates a common /24 network", () => {
    expect(calculateSubnet("192.168.1.10", 24)).toEqual({
      ip: "192.168.1.10",
      cidr: 24,
      network: "192.168.1.0",
      broadcast: "192.168.1.255",
      mask: "255.255.255.0",
      first: "192.168.1.1",
      last: "192.168.1.254",
      totalAddresses: 256,
      usableHosts: 254,
    });
  });

  it("calculates a /16 network", () => {
    expect(calculateSubnet("10.20.5.9", 16)).toMatchObject({
      network: "10.20.0.0",
      broadcast: "10.20.255.255",
      mask: "255.255.0.0",
      first: "10.20.0.1",
      last: "10.20.255.254",
      totalAddresses: 65_536,
      usableHosts: 65_534,
    });
  });

  it("handles /0 without JavaScript 32-bit shift overflow", () => {
    expect(calculateSubnet("203.0.113.9", 0)).toMatchObject({
      network: "0.0.0.0",
      broadcast: "255.255.255.255",
      mask: "0.0.0.0",
      totalAddresses: 4_294_967_296,
      usableHosts: 4_294_967_294,
    });
  });

  it("supports RFC 3021 /31 and single-host /32 networks", () => {
    expect(calculateSubnet("192.0.2.10", 31)).toMatchObject({
      network: "192.0.2.10",
      broadcast: "192.0.2.11",
      first: "192.0.2.10",
      last: "192.0.2.11",
      usableHosts: 2,
    });
    expect(calculateSubnet("192.0.2.10", 32)).toMatchObject({
      network: "192.0.2.10",
      broadcast: "192.0.2.10",
      first: "192.0.2.10",
      last: "192.0.2.10",
      usableHosts: 1,
    });
  });

  it("rejects invalid addresses and prefixes", () => {
    expect(() => calculateSubnet("300.1.1.1", 24)).toThrow("invalid_ipv4");
    expect(() => cidrToMask(-1)).toThrow("invalid_cidr");
    expect(() => cidrToMask(33)).toThrow("invalid_cidr");
    expect(() => cidrToMask(24.5)).toThrow("invalid_cidr");
  });
});
