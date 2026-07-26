export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Prefer IPv4 when resolving hostnames in development.
    //
    // Neon publishes both A and AAAA records. Node 17+ defaults to
    // `verbatim` result order, which hands addresses to the connector in
    // whatever order the resolver returned them — frequently IPv6 first.
    // On a machine with an IPv6 address but no working IPv6 route (very
    // common on Windows behind consumer routers, corporate VPNs, and
    // split-tunnel setups) every connection attempt burns the full
    // connect_timeout on an unreachable address before IPv4 is tried.
    //
    // Prisma reports that as P1001 "Can't reach database server", which
    // reads as an outage even though the database is perfectly healthy
    // and IPv4 would have connected in ~30ms. It also explains requests
    // that hang for 15-30s and then fail.
    //
    // Development only: Vercel's IPv6 path works, and production should
    // keep Node's standard resolution behaviour. Set DNS_RESULT_ORDER to
    // override in either direction.
    const order = process.env.DNS_RESULT_ORDER
      || (process.env.NODE_ENV === "production" ? "verbatim" : "ipv4first");
    if (order === "ipv4first" || order === "verbatim") {
      const dns = await import("node:dns");
      dns.setDefaultResultOrder(order);
    }

    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
