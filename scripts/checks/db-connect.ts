/**
 * Database connectivity doctor.
 *
 *   pnpm db:doctor
 *
 * Prisma's P1001 ("Can't reach database server") is a single message for at
 * least six unrelated failures: a missing .env, a typo'd host, DNS that
 * resolves to an unroutable AAAA record, a firewall that drops 5432, a TLS
 * handshake that never completes, a suspended Neon project, or bad
 * credentials on a pooler that refuses the connection before authenticating.
 *
 * Guessing between those costs more time than the bug does. This walks the
 * connection one layer at a time and reports which layer broke, so the fix
 * is obvious instead of inferred.
 *
 * It reads .env directly rather than relying on the Next runtime, because
 * "the app can't see the variable" is itself one of the failure modes we
 * need to be able to observe.
 */
import fs from "node:fs";
import net from "node:net";
import tls from "node:tls";
import dns from "node:dns/promises";
import path from "node:path";

// ─── env ──────────────────────────────────────────────────────────────

/** tsx does not load .env the way `next dev` does. Load it by hand so this
 *  script sees exactly what Prisma would see. */
function loadEnvFiles(): string[] {
  const loaded: string[] = [];
  // Next's precedence: .env.local wins over .env in development.
  for (const file of [".env", ".env.local", ".env.development.local"]) {
    const full = path.resolve(process.cwd(), file);
    if (!fs.existsSync(full)) continue;
    loaded.push(file);
    const raw = fs.readFileSync(full, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value; // later files override earlier ones
    }
  }
  return loaded;
}

// ─── output ───────────────────────────────────────────────────────────

const OK = "\u2713";
const BAD = "\u2717";
const WARN = "\u26a0";

let failures = 0;
const hints: string[] = [];

function pass(label: string, detail = "") {
  console.log(`  ${OK} ${label}${detail ? `  ${detail}` : ""}`);
}
function fail(label: string, detail = "", hint?: string) {
  failures++;
  console.log(`  ${BAD} ${label}${detail ? `  ${detail}` : ""}`);
  if (hint) hints.push(hint);
}
function warn(label: string, detail = "", hint?: string) {
  console.log(`  ${WARN} ${label}${detail ? `  ${detail}` : ""}`);
  if (hint) hints.push(hint);
}
function step(n: number, title: string) {
  console.log(`\n${n}. ${title}`);
}

/** Never print a password, even into a local terminal that may get pasted
 *  into a chat window. */
function redact(url: string): string {
  return url.replace(/\/\/([^:/@]+):([^@]*)@/, "//$1:****@");
}

type Parsed = {
  host: string;
  port: number;
  user: string;
  database: string;
  params: URLSearchParams;
};

function parseUrl(raw: string): Parsed | null {
  try {
    const u = new URL(raw);
    return {
      host: u.hostname,
      port: u.port ? Number(u.port) : 5432,
      user: decodeURIComponent(u.username),
      database: u.pathname.replace(/^\//, ""),
      params: u.searchParams,
    };
  } catch {
    return null;
  }
}

/**
 * The doctor runs only a handful of serial probes, so it must never inherit
 * Prisma's hardware-derived default pool (33 on the owner's Windows host).
 * That default can itself exhaust a small Neon pooler and turn the diagnostic
 * into a false P2024. Force one short-lived connection without mutating .env.
 */
function doctorPrismaUrl(raw: string): string {
  const url = new URL(raw);
  url.searchParams.set("connection_limit", "1");
  url.searchParams.set("pool_timeout", "15");
  return url.toString();
}

// ─── probes ───────────────────────────────────────────────────────────

function tcpProbe(
  host: string,
  port: number,
  family: 0 | 4 | 6,
  timeoutMs: number
): Promise<{ ok: boolean; ms: number; error?: string }> {
  return new Promise((resolve) => {
    const started = Date.now();
    let settled = false;
    const done = (ok: boolean, error?: string) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ ok, ms: Date.now() - started, error });
    };
    const socket = net.connect({ host, port, family });
    socket.setTimeout(timeoutMs, () => done(false, "timed out"));
    socket.on("connect", () => done(true));
    socket.on("error", (e: NodeJS.ErrnoException) => done(false, e.code || e.message));
  });
}

/**
 * Postgres does not speak TLS on connect; the client sends an 8-byte
 * SSLRequest and the server answers with a single 'S' or 'N'. Doing that
 * by hand distinguishes "the port is open but something in the middle is
 * mangling the protocol" (a captive portal, a TLS-inspecting proxy, an
 * antivirus doing HTTPS scanning) from a clean path to real Postgres.
 */
function sslRequestProbe(
  host: string,
  port: number,
  timeoutMs: number
): Promise<{ ok: boolean; ms: number; reply?: string; error?: string }> {
  return new Promise((resolve) => {
    const started = Date.now();
    let settled = false;
    const done = (ok: boolean, extra: { reply?: string; error?: string } = {}) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ ok, ms: Date.now() - started, ...extra });
    };
    const socket = net.connect({ host, port });
    socket.setTimeout(timeoutMs, () => done(false, { error: "timed out" }));
    socket.on("connect", () => {
      const packet = Buffer.alloc(8);
      packet.writeInt32BE(8, 0);
      packet.writeInt32BE(80877103, 4); // 1234 << 16 | 5679
      socket.write(packet);
    });
    socket.on("data", (buf) => {
      const reply = buf.toString("latin1", 0, 1);
      done(reply === "S" || reply === "N", { reply });
    });
    socket.on("error", (e: NodeJS.ErrnoException) => done(false, { error: e.code || e.message }));
  });
}

function tlsProbe(
  host: string,
  port: number,
  timeoutMs: number
): Promise<{ ok: boolean; ms: number; protocol?: string; error?: string }> {
  return new Promise((resolve) => {
    const started = Date.now();
    let settled = false;
    const done = (ok: boolean, extra: { protocol?: string; error?: string } = {}) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ ok, ms: Date.now() - started, ...extra });
    };
    const socket = net.connect({ host, port });
    socket.setTimeout(timeoutMs, () => done(false, { error: "timed out" }));
    socket.on("connect", () => {
      const packet = Buffer.alloc(8);
      packet.writeInt32BE(8, 0);
      packet.writeInt32BE(80877103, 4);
      socket.write(packet);
    });
    socket.once("data", (buf) => {
      if (buf.toString("latin1", 0, 1) !== "S") {
        return done(false, { error: "server refused SSL" });
      }
      const secure = tls.connect(
        { socket, servername: host, rejectUnauthorized: false },
        () => {
          const protocol = secure.getProtocol() || "unknown";
          secure.destroy();
          done(true, { protocol });
        }
      );
      secure.on("error", (e: NodeJS.ErrnoException) => done(false, { error: e.code || e.message }));
    });
    socket.on("error", (e: NodeJS.ErrnoException) => done(false, { error: e.code || e.message }));
  });
}

// ─── main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("TechBox database connectivity doctor");
  console.log("=".repeat(36));

  // 1 ─ environment
  step(1, "Environment");
  const loaded = loadEnvFiles();
  if (loaded.length === 0) {
    fail(
      ".env not found",
      `looked in ${process.cwd()}`,
      "Create .env from .env.example and fill in DATABASE_URL / DIRECT_URL. Run this from the repo root."
    );
    return report();
  }
  pass("env files", loaded.join(", "));
  console.log(`  \u00b7 node ${process.version} on ${process.platform}`);

  const dbUrl = process.env.DATABASE_URL || "";
  const directUrl = process.env.DIRECT_URL || "";

  if (!dbUrl) {
    fail("DATABASE_URL", "empty or missing", "Set DATABASE_URL in .env to your Neon pooled connection string.");
    return report();
  }
  pass("DATABASE_URL", redact(dbUrl));
  if (directUrl) pass("DIRECT_URL", redact(directUrl));
  else warn("DIRECT_URL", "not set", "Migrations need DIRECT_URL (the non-pooled host).");

  const parsed = parseUrl(dbUrl);
  if (!parsed) {
    fail(
      "DATABASE_URL is not a valid URL",
      "",
      "Check for stray quotes, spaces, or a line break inside the value. The password must be percent-encoded if it contains @ : / ? # or %."
    );
    return report();
  }

  console.log(`  \u00b7 host     ${parsed.host}`);
  console.log(`  \u00b7 port     ${parsed.port}`);
  console.log(`  \u00b7 database ${parsed.database}`);
  console.log(`  \u00b7 user     ${parsed.user}`);
  const sslmode = parsed.params.get("sslmode");
  if (sslmode) console.log(`  \u00b7 sslmode  ${sslmode}`);

  for (const key of ["sslmode", "channel_binding", "connection_limit", "pool_timeout", "connect_timeout"]) {
    if (parsed.params.getAll(key).length > 1) {
      warn(
        `duplicate ${key}`,
        `${parsed.params.getAll(key).length} copies`,
        `Keep exactly one ${key} parameter. Copy a fresh connection string from Neon instead of appending options to an older URL.`,
      );
    }
  }

  if (!/-pooler\./.test(parsed.host)) {
    warn(
      "DATABASE_URL does not use the -pooler host",
      "",
      "Neon serves app traffic through the pooler. Use the -pooler host for DATABASE_URL and the plain host for DIRECT_URL."
    );
  }

  // 2 ─ DNS
  step(2, "DNS resolution");
  let v4: string[] = [];
  let v6: string[] = [];
  try {
    v4 = (await dns.resolve4(parsed.host)).slice(0, 4);
    pass("A records", v4.join(", "));
  } catch (e: any) {
    fail(
      "A records",
      e.code || String(e),
      "DNS cannot resolve the host. Check the hostname for typos, then try a public resolver (1.1.1.1 / 8.8.8.8). If your Neon project was deleted the host stops resolving entirely."
    );
  }
  try {
    v6 = (await dns.resolve6(parsed.host)).slice(0, 4);
    pass("AAAA records", v6.join(", "));
  } catch {
    console.log(`  \u00b7 AAAA records  none (fine \u2014 IPv4 only)`);
  }

  if (v4.length === 0 && v6.length === 0) return report();

  // 2b ─ what the connector is ACTUALLY handed
  //
  // Step 2 used resolve4/resolve6, which query the DNS server directly and
  // therefore always see every published record. No connector works that
  // way. Prisma, pg, and Node itself all go through getaddrinfo, which
  // applies AI_ADDRCONFIG and omits AAAA entirely when the machine has no
  // global IPv6 source address.
  //
  // Conflating the two produced a wrong diagnosis once already, so the
  // distinction is now measured rather than assumed: only addresses that
  // appear here can possibly participate in a connection attempt.
  let lookupAddrs: { address: string; family: number }[] = [];
  try {
    lookupAddrs = await dns.lookup(parsed.host, { all: true });
    const v4Count = lookupAddrs.filter((a) => a.family === 4).length;
    const v6Count = lookupAddrs.filter((a) => a.family === 6).length;
    pass(
      "getaddrinfo",
      `${v4Count} IPv4, ${v6Count} IPv6 offered to the connector` +
        (v6.length > 0 && v6Count === 0 ? " (AAAA published but filtered out locally)" : "")
    );
  } catch (e: any) {
    fail("getaddrinfo", e.code || String(e), "The OS resolver cannot resolve this host even though DNS can.");
  }

  const connectorGetsV6 = lookupAddrs.some((a) => a.family === 6);

  // 3 ─ TCP, per address family
  step(3, "TCP reachability (port " + parsed.port + ")");
  let anyTcp = false;
  if (v4.length) {
    const r = await tcpProbe(parsed.host, parsed.port, 4, 10_000);
    if (r.ok) {
      anyTcp = true;
      pass("IPv4", `connected in ${r.ms}ms`);
    } else {
      fail(
        "IPv4",
        `${r.error} after ${r.ms}ms`,
        r.error === "timed out"
          ? "Port 5432 outbound is being dropped. Usual suspects: corporate/ISP firewall, VPN split-tunnel, or Windows Defender Firewall. Test from a phone hotspot to confirm."
          : "The TCP connection was refused or reset before Postgres answered."
      );
    }
  }
  if (v6.length) {
    const r = await tcpProbe(parsed.host, parsed.port, 6, 10_000);
    if (r.ok) {
      anyTcp = true;
      pass("IPv6", `connected in ${r.ms}ms`);
    } else if (!connectorGetsV6 || r.error === "ENOENT" || r.error === "EAI_AGAIN") {
      // ENOENT from a family:6 probe means getaddrinfo has no AAAA to give
      // for this host on this machine. Nothing will ever attempt IPv6, so
      // this is a non-finding — not a latent hazard, and not something a
      // resolution-order setting can influence.
      console.log(
        `  \u00b7 IPv6  not offered by the OS resolver (${r.error}) \u2014 harmless; nothing attempts IPv6`
      );
    } else {
      // ENETUNREACH / EHOSTUNREACH / timeout are different: the address IS
      // handed to the connector and then stalls, burning connect_timeout
      // before IPv4 is tried. That genuinely surfaces as P1001.
      warn(
        "IPv6",
        `${r.error} after ${r.ms}ms`,
        "IPv6 addresses are offered to the connector but unreachable, so connection attempts can stall on them before falling back to IPv4. `pnpm dev` already sets ipv4first; if this persists, disable IPv6 on the network adapter."
      );
    }
  }
  if (!anyTcp) return report();

  // 4 ─ Postgres wire protocol + TLS
  step(4, "Postgres protocol and TLS");
  const ssl = await sslRequestProbe(parsed.host, parsed.port, 10_000);
  if (ssl.ok) {
    pass("SSLRequest", `server replied '${ssl.reply}' in ${ssl.ms}ms`);
  } else {
    fail(
      "SSLRequest",
      ssl.error || `unexpected reply '${ssl.reply}'`,
      "The port is open but the peer is not speaking the Postgres protocol. Something is intercepting the connection \u2014 a TLS-inspecting proxy, antivirus HTTPS scanning, or a captive portal."
    );
    return report();
  }

  const handshake = await tlsProbe(parsed.host, parsed.port, 15_000);
  if (handshake.ok) {
    pass("TLS handshake", `${handshake.protocol} in ${handshake.ms}ms`);
  } else {
    fail(
      "TLS handshake",
      handshake.error || "failed",
      "TCP works but TLS does not complete. Corporate TLS interception and outdated system root certificates are the common causes."
    );
    return report();
  }

  // 5 ─ Prisma
  //
  // Everything above can pass while Prisma still fails: wrong password,
  // wrong database name, a suspended Neon project, or a client generated
  // against a different schema. Running the real client is the only way
  // to rule those out.
  step(5, "Prisma query");
  let doctorClient: { $disconnect: () => Promise<void> } | undefined;
  try {
    const { PrismaClient } = await import("@prisma/client");
    const client = new PrismaClient({
      log: [],
      datasources: { db: { url: doctorPrismaUrl(dbUrl) } },
    });
    doctorClient = client;
    console.log("  · probe pool  1 connection (isolated from the app pool)");
    const started = Date.now();
    const rows = await client.$queryRawUnsafe<{ v: string }[]>("select version() as v");
    pass("select version()", `${Date.now() - started}ms`);
    console.log(`  \u00b7 ${String(rows[0]?.v || "").split(",")[0]}`);

    // A generated client that predates the last schema change is its own
    // recurring failure mode here, and it surfaces as "Cannot read
    // properties of undefined (reading 'findMany')" — a TypeError that
    // never mentions Prisma at all. It has cost this repo three separate
    // debugging sessions.
    //
    // Read the model list out of schema.prisma rather than hardcoding it,
    // so this keeps working for models that do not exist yet.
    const missing = staleModels(client);
    if (missing === null) {
      warn("generated client", "could not read prisma/schema.prisma to verify");
    } else if (missing.length) {
      fail(
        "generated client is stale",
        `missing: ${missing.join(", ")}`,
        "Run `pnpm prisma generate`, then restart the dev server.\n" +
          "     If that fails on Windows with EPERM/EBUSY, a running `next dev` is holding\n" +
          "     the query-engine DLL open — stop every Node process first (taskkill /F /IM node.exe)."
      );
    } else {
      pass("generated client", "in sync with schema.prisma");
    }

    // Keep the probe fully serial: it deliberately has a one-connection pool
    // and should never manufacture the pool pressure it is diagnosing.
    const posts = await client.post.count();
    const users = await client.user.count();
    pass("row counts", `posts ${posts} \u00b7 users ${users}`);
  } catch (e: any) {
    // Prisma prefixes several connection failures with a generic
    // "Invalid prisma.$queryRaw... invocation" line. That was all the
    // doctor printed, hiding the actionable P1001/P1000 sentence that comes
    // later in the same message. Select a safe, useful line instead.
    const message = String(e?.message || e);
    const inferredCode = inferPrismaCode(e?.code, message);
    const lines = message.split("\n").map((line) => line.trim()).filter(Boolean);
    const useful = lines.find((line) =>
      /Can't reach database server|Authentication failed|timed out|closed the connection|connection pool|database .* does not exist/i.test(line)
    );
    const detail = useful || lines.find((line) => !/^Invalid `?prisma\./i.test(line)) || message;
    const code = inferredCode ? ` [${inferredCode}]` : "";
    fail("Prisma", `${redact(detail)}${code}`, prismaHint(inferredCode));
  } finally {
    await doctorClient?.$disconnect().catch(() => {});
  }

  report();
}

/**
 * Model names declared in schema.prisma that the generated client does not
 * expose. Returns null if the schema cannot be read.
 *
 * Parsing the schema instead of hardcoding a list means a model added
 * tomorrow is covered without anyone remembering to update this file —
 * which is precisely the maintenance step that fails in practice.
 */
function staleModels(client: unknown): string[] | null {
  const schemaPath = path.resolve(process.cwd(), "prisma/schema.prisma");
  if (!fs.existsSync(schemaPath)) return null;
  const schema = fs.readFileSync(schemaPath, "utf8");

  const declared = [...schema.matchAll(/^\s*model\s+([A-Za-z0-9_]+)\s*\{/gm)].map((m) => m[1]);
  if (declared.length === 0) return null;

  const bag = client as Record<string, { findMany?: unknown } | undefined>;
  return declared
    .map((name) => ({ name, key: name.charAt(0).toLowerCase() + name.slice(1) }))
    .filter(({ key }) => typeof bag[key]?.findMany !== "function")
    .map(({ name }) => name);
}

/** Infer the Prisma connectivity code from engines that omit `error.code`. */
function inferPrismaCode(code: unknown, message: string): string | undefined {
  if (typeof code === "string") return code;
  if (/Can't reach database server/i.test(message)) return "P1001";
  if (/Authentication failed/i.test(message)) return "P1000";
  if (/Timed out fetching a new connection|connection pool/i.test(message)) return "P2024";
  if (/Server has closed the connection/i.test(message)) return "P1017";
  if (/database .* does not exist/i.test(message)) return "P1003";
  return undefined;
}

function prismaHint(code?: string): string {
  switch (code) {
    case "P1000":
      return "Authentication failed. The password in DATABASE_URL is wrong, or it contains a character that must be percent-encoded (@ : / ? # %).";
    case "P1001":
      return "Prisma cannot authenticate/connect even though TCP and TLS passed. Copy fresh pooled and direct URLs from Neon, remove duplicate parameters, and verify that .env.local is not overriding .env with an old password.";
    case "P1002":
      return "The server was reached but timed out during handshake. Raise connect_timeout in DATABASE_URL.";
    case "P1003":
      return "The database named in the URL does not exist. Neon's default is `neondb`.";
    case "P1017":
      return "The server closed the connection. On Neon this usually means the compute suspended mid-query; the next request wakes it.";
    case "P2024":
      return "The doctor uses one isolated connection and runs one serial query, so this is not application concurrency. Prisma could not establish its first connection before pool_timeout; refresh the Neon URL/password and remove duplicate connection parameters.";
    default:
      return "";
  }
}

function report() {
  console.log("\n" + "=".repeat(36));
  if (failures === 0) {
    console.log(`${OK} No connectivity problems found.`);
    if (hints.length) {
      console.log("\nNotes:");
      hints.forEach((h) => console.log(`  \u00b7 ${h}`));
    }
  } else {
    console.log(`${BAD} ${failures} problem${failures === 1 ? "" : "s"} found.\n`);
    console.log("What to do:");
    hints.forEach((h, i) => console.log(`  ${i + 1}. ${h}`));
  }
  console.log("");
  process.exit(failures > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("\nDoctor crashed:", e);
  process.exit(1);
});
