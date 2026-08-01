import * as Sentry from "@sentry/nextjs";

// Required by Next 15+ / Sentry 10 to report nested React Server Component
// render errors. Keeping it in instrumentation.ts lets Next invoke it in the
// same runtime where `register()` loads the matching Sentry configuration.
export const onRequestError = Sentry.captureRequestError;

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Prefer IPv4 when resolving hostnames in development.
    //
    // Neon publishes both A and AAAA records. Node 17+ defaults to
    // `verbatim` result order, so when getaddrinfo does return AAAA on a
    // machine with no working IPv6 route, connection attempts can stall
    // on an unreachable address before IPv4 is tried, and Prisma reports
    // that as P1001 on a perfectly healthy database.
    //
    // Scope note, because this was initially overstated: it only helps
    // when the OS resolver actually hands back IPv6 addresses. Windows
    // applies AI_ADDRCONFIG and omits AAAA entirely when the machine has
    // no global IPv6 source address — in that case nothing ever attempts
    // IPv6 and this setting is a harmless no-op. `pnpm db:doctor`
    // distinguishes the two cases explicitly.
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
