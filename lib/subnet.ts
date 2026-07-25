export type SubnetResult = {
  ip: string;
  cidr: number;
  network: string;
  broadcast: string;
  mask: string;
  first: string;
  last: string;
  totalAddresses: number;
  usableHosts: number;
};

export function isValidIpv4(value: string) {
  const parts = value.trim().split(".");
  return parts.length === 4 && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) >= 0 && Number(part) <= 255);
}

export function ipv4ToInt(value: string) {
  if (!isValidIpv4(value)) throw new Error("invalid_ipv4");
  return value.trim().split(".").reduce((total, part) => ((total << 8) | Number(part)) >>> 0, 0) >>> 0;
}

export function intToIpv4(value: number) {
  const normalized = value >>> 0;
  return [24, 16, 8, 0].map((shift) => (normalized >>> shift) & 255).join(".");
}

export function cidrToMask(cidr: number) {
  if (!Number.isInteger(cidr) || cidr < 0 || cidr > 32) throw new Error("invalid_cidr");
  return cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
}

export function calculateSubnet(ip: string, cidr: number): SubnetResult {
  const address = ipv4ToInt(ip);
  const mask = cidrToMask(cidr);
  const network = (address & mask) >>> 0;
  const hostMask = (~mask) >>> 0;
  const broadcast = (network | hostMask) >>> 0;
  const totalAddresses = 2 ** (32 - cidr);

  // RFC 3021 allows both addresses on /31 point-to-point networks. A /32 is a
  // single host route. Traditional network/broadcast exclusion applies to /0-/30.
  const usableHosts = cidr === 32 ? 1 : cidr === 31 ? 2 : Math.max(0, totalAddresses - 2);
  const first = cidr >= 31 ? network : (network + 1) >>> 0;
  const last = cidr >= 31 ? broadcast : (broadcast - 1) >>> 0;

  return {
    ip: intToIpv4(address),
    cidr,
    network: intToIpv4(network),
    broadcast: intToIpv4(broadcast),
    mask: intToIpv4(mask),
    first: intToIpv4(first),
    last: intToIpv4(last),
    totalAddresses,
    usableHosts,
  };
}
