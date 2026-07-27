import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isDbUnreachable,
  isStalePrismaClient,
  describeDbError,
  logDbFailure,
  noteDbSuccess,
} from "@/lib/db-error";

/** A P1001 shaped exactly like the ones Prisma 6.19 throws, including the
 *  Turbopack-mangled invocation line that makes them so unreadable. */
function p1001() {
  const e = new Error(
    "\nInvalid `__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__" +
      "$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[\"prisma\"].post.findMany()` invocation in\n" +
      "D:\\Dev\\techbox\\.next\\dev\\server\\chunks\\ssr\\_1k2qs_c._.js:2787:147\n\n" +
      "Can't reach database server at `ep-twilight-hall-atc6iest-pooler.c-9.us-east-1.aws.neon.tech:5432`\n"
  ) as Error & { code?: string; meta?: unknown };
  e.code = "P1001";
  e.meta = { database_location: "ep-twilight-hall-atc6iest-pooler.c-9.us-east-1.aws.neon.tech:5432" };
  return e;
}

function withCode(code: string, message = "boom") {
  const e = new Error(message) as Error & { code?: string };
  e.code = code;
  return e;
}

describe("isDbUnreachable", () => {
  it("recognises every connectivity code", () => {
    for (const code of ["P1000", "P1001", "P1002", "P1008", "P1017", "P2024"]) {
      expect(isDbUnreachable(withCode(code)), code).toBe(true);
    }
  });

  it("recognises the message even without a code", () => {
    expect(isDbUnreachable(new Error("Can't reach database server at `x:5432`"))).toBe(true);
    expect(isDbUnreachable(new Error("Timed out fetching a new connection from the pool"))).toBe(true);
  });

  it("does not swallow application-level errors", () => {
    // P2002 (unique constraint) and P2025 (not found) are real bugs or
    // real user input problems. Collapsing them into a one-liner would
    // hide the stack trace that actually matters.
    expect(isDbUnreachable(withCode("P2002"))).toBe(false);
    expect(isDbUnreachable(withCode("P2025"))).toBe(false);
    expect(isDbUnreachable(new Error('column "nope" does not exist'))).toBe(false);
    expect(isDbUnreachable(null)).toBe(false);
    expect(isDbUnreachable(undefined)).toBe(false);
  });
});

describe("isStalePrismaClient", () => {
  it("catches the TypeError a regenerated-schema mismatch produces", () => {
    // This exact shape has hit the repo three times: User.createdAt,
    // Post.reviewedProductId, and Partner.
    expect(
      isStalePrismaClient(new TypeError("Cannot read properties of undefined (reading 'findMany')"))
    ).toBe(true);
    expect(
      isStalePrismaClient(new TypeError("Cannot read properties of undefined (reading 'count')"))
    ).toBe(true);
  });

  it("ignores unrelated TypeErrors", () => {
    expect(
      isStalePrismaClient(new TypeError("Cannot read properties of undefined (reading 'map')"))
    ).toBe(false);
    expect(isStalePrismaClient(new Error("nope"))).toBe(false);
  });
});

describe("describeDbError", () => {
  it("reduces a 6-line P1001 to one line naming the host", () => {
    const summary = describeDbError(p1001());
    expect(summary).toBe(
      "database unreachable (ep-twilight-hall-atc6iest-pooler.c-9.us-east-1.aws.neon.tech:5432)"
    );
    expect(summary).not.toContain("TURBOPACK");
    expect(summary.split("\n")).toHaveLength(1);
  });

  it("names the specific connectivity failure", () => {
    expect(describeDbError(withCode("P1000"))).toContain("authentication failed");
    expect(describeDbError(withCode("P2024"))).toContain("pool timeout");
    expect(describeDbError(withCode("P1017"))).toContain("closed the connection");
  });

  it("tells you the fix for a stale client", () => {
    expect(
      describeDbError(new TypeError("Cannot read properties of undefined (reading 'findMany')"))
    ).toContain("prisma generate");
  });

  it("keeps the first meaningful line of an ordinary error", () => {
    expect(describeDbError(new Error('column "nope" does not exist'))).toBe(
      'column "nope" does not exist'
    );
  });
});

describe("logDbFailure", () => {
  // Connectivity failures log at WARN, not error. Every caller catches and
  // degrades, and Next's dev overlay promotes console.error into a blocking
  // red modal — so error severity on a handled fallback buries the screen
  // in popups for something working as designed. `errorSpy` below asserts
  // that genuine bugs still use error.
  let spy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("collapses a storm of identical errors into a single report", () => {
    // One page render with the database down previously produced dozens of
    // full stack traces. The scope name is unique per test to avoid the
    // module-level cooldown map leaking between cases.
    const scope = `test-storm-${Math.random()}`;
    for (let i = 0; i < 50; i++) logDbFailure(scope, p1001());
    // Summary + remedy line, once.
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("reports each scope independently", () => {
    const a = `test-a-${Math.random()}`;
    const b = `test-b-${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      logDbFailure(a, p1001());
      logDbFailure(b, p1001());
    }
    expect(spy).toHaveBeenCalledTimes(4); // 2 scopes x (summary + remedy)
  });

  it("returns true only for the call that actually logged", () => {
    const scope = `test-return-${Math.random()}`;
    expect(logDbFailure(scope, p1001())).toBe(true);
    expect(logDbFailure(scope, p1001())).toBe(false);
  });

  it("logs again when the failure mode changes", () => {
    // A pool timeout following an outage is new information, not a repeat.
    const scope = `test-change-${Math.random()}`;
    logDbFailure(scope, p1001());
    spy.mockClear();
    logDbFailure(scope, withCode("P2024"));
    expect(spy).toHaveBeenCalled();
  });

  it("preserves the full error object for genuine bugs", () => {
    const scope = `test-bug-${Math.random()}`;
    const bug = new Error('column "nope" does not exist');
    logDbFailure(scope, bug);
    // Application bugs keep console.error AND the full error object, so the
    // stack survives and the dev overlay still surfaces them.
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0]).toContain(bug);
    expect(spy).not.toHaveBeenCalled();
  });

  it("uses warn (not error) for connectivity, so the dev overlay stays quiet", () => {
    const scope = `test-severity-${Math.random()}`;
    logDbFailure(scope, p1001());
    expect(spy).toHaveBeenCalled();       // console.warn
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("reports the next failure immediately after a recovery", () => {
    const scope = `test-recover-${Math.random()}`;
    logDbFailure(scope, p1001());
    noteDbSuccess(scope);
    spy.mockClear();
    logDbFailure(scope, p1001());
    expect(spy).toHaveBeenCalled();
  });
});
