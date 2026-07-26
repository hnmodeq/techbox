# Neon → Supabase: should you, and how

**Written 2026-07-26. Measured against the live database, not guessed.**

---

## 0. RESOLVED (2026-07-26): it was network transfer, and it is fixed

The owner reported **4.58 / 5 GB network transfer**. That is the meter, not
storage (which is 15 MB, 2.8% — see §1).

**Do not migrate.** Supabase Free caps egress at 5 GB too, so moving would
have carried the identical problem to a new provider and cost a day.

**Root cause: the homepage transferred 479 kB per render to display cards
that needed 57 kB.** Two defects, both measured against the live database:

1. **The news ticker used the full 35-column `cardSelect` for 30 rows** —
   361 kB per render — while `NewsTicker.tsx` renders only module, slug,
   title and a relative date. **82% of that payload was `specs`**: QNAP
   product JSON blobs up to 40.5 kB each, on 16 of the 30 rows.
2. **`cardSelect` fetched `specs`, `warranty` and `reviewedProductId`,
   which `normalizeCard()` never emitted.** Fetched every render, dropped
   on the floor.

Fix: a dedicated 5-field `tickerSelect` + `normalizeTickerCard()`, and
those three columns removed from `cardSelect`.

| | before | after | saved |
|---|---|---|---|
| Homepage render | 479.3 kB | **56.9 kB** | **88%** |
| Every other route (layout ticker) | 22.3 kB | **13.6 kB** | **39%** |

Verified the ticker returns **byte-identical module/slug/title/date for all
30 rows**. Nothing visible changed.

At the previous rate 4.58 GB represented ~215,000 route renders; the same
traffic now costs roughly an eighth of that. Seven regression tests in
`tests/unit/egress.test.ts` fail if `specs` is ever re-added — verified by
deliberately re-adding it and watching the suite go red.

**Remaining action:** transfer resets at the start of your Neon billing
period. If you are close to the cap before then, the site may briefly
suspend; after the reset the new figures apply.

---

## 1. Storage is not the problem: your data is 15 MB

This is the single most important number in this document.

```
LOGICAL DATA SIZE: 15 MB  (15,286,272 bytes)
Neon free cap    : 0.5 GB = 536,870,912 bytes
That is 2.8% of the cap
```

Largest tables:

| Table | Size | Rows |
|---|---|---|
| Post | 1888 kB | 164 |
| Like | 832 kB | 347 |
| Comment | 344 kB | 151 |
| TimelineEvent | 160 kB | 21 |
| SiteSetting | 152 kB | 58 |
| User | 152 kB | 23 |
| *everything else* | < 150 kB each | — |

`public` schema total: **8.6 MB**.

**So the 91% you are seeing is not your data.** Neon's free plan meters four
separate things, and only one of them is data size:

| Meter | Free allowance | Your usage |
|---|---|---|
| **Storage** | 0.5 GB / project | **15 MB (2.8%)** — measured |
| **Compute** | 100 CU-hours / project / month | *unknown — check dashboard* |
| **Network transfer** | 5 GB / project / month | *unknown — check dashboard* |
| Instant restore history | 6 h, capped 1 GB-month | *unknown* |

Go to the Neon dashboard and look at **which bar is at 91%**. The answer
changes the correct action completely:

- **If it is Compute (CU-hours)** — migrating to Supabase genuinely helps,
  because Supabase Free does not meter compute-hours at all. See §3.
- **If it is Storage** — something is wrong that migrating will not fix.
  Your data is 15 MB. Moving 15 MB into a different 500 MB box changes
  nothing. Investigate first (§2).
- **If it is Network transfer** — same conclusion. Migrating moves the
  problem, since Supabase Free also allows only 5 GB egress.

Running out of compute hours is by far the most likely explanation, because
a `pnpm dev` session holds a connection open and Neon only scales to zero
after 5 minutes of *complete* inactivity.

---

## 2. Free things to try before migrating

If the 91% is compute or transfer, these may drop it far enough that no
migration is needed. All are zero-cost.

**a. Stop dev servers when you are not using them.** Every idle `pnpm dev`
holds a pooled connection. Neon cannot scale to zero while a session is
open, so an afternoon of a forgotten dev server burns several CU-hours for
no work at all. This is the most common cause of an unexpectedly high
compute bar on a low-traffic project.

**b. Reduce the notification poll.** `components/layout/site-header.tsx`
fetches `/api/notifications` with `cache: "no-store"`. Every logged-in tab
holding that open keeps the compute awake. Your own log showed this
endpoint taking 5.7s once — it is already known to be heavy.

**c. `autoPublishScheduled()` runs on every root-layout render.** It has a
60s in-process cooldown, but serverless means a fresh process per cold
start, so on Vercel the cooldown resets far more often than intended. It is
one `updateMany` each time.

**d. Check the instant-restore history window.** Free retains 6 hours. If
you have been running large content passes, WAL churn counts against the
1 GB-month history cap independently of your 15 MB of data.

**e. `VACUUM` if storage really is the bar.** Neon's scale-to-zero loses
the statistics autovacuum relies on, so a project that sleeps a lot can
accumulate dead tuples that never get reclaimed:

```sql
VACUUM (VERBOSE, ANALYZE);
```

Worth running before concluding you need more space.

---

## 3. Neon vs Supabase on the free plan

Both are real PostgreSQL. Neither expires. Neither needs a credit card.

| | **Neon Free** | **Supabase Free** |
|---|---|---|
| Database size | 0.5 GB / project | 0.5 GB / project |
| Compute | **100 CU-hours/mo, metered** | Shared CPU, 500 MB RAM, **not metered** |
| Idle behaviour | Scales to zero after 5 min, **auto-wakes in ~300ms** | **Pauses after 7 days idle, needs MANUAL restore** |
| Egress | 5 GB/mo | 5 GB/mo |
| File storage | — (beta object storage) | **1 GB included** |
| Projects | 100 | **2 active** |
| Backups | 1 manual snapshot, 6 h history | **None on free** |
| Branching | Yes, 10/project | No |
| Postgres version | 17.10 (yours) | 15–17 |

### The two differences that actually matter for you

**Compute metering — advantage Supabase.** Neon suspends your whole project
when you exhaust 100 CU-hours, and it stays suspended until the next
billing month. Supabase does not meter compute on free at all. If your 91%
is CU-hours, this is a real, permanent fix.

**Idle pausing — advantage Neon, and it is a serious catch.** Neon's
scale-to-zero is invisible: a request after idle wakes it in a few hundred
milliseconds. Supabase's 7-day pause is *not* invisible — the project goes
offline and **you must log into the dashboard and restore it by hand**. For
`hnmodeq-techbox.vercel.app`, a live site that people visit, this is
unlikely to trigger. But if the site goes quiet for a week, it goes down
and stays down until you notice.

**Backups — advantage Neon, mildly.** Supabase Free has no automatic
backups at all. Neon Free gives you 6 hours of instant-restore history and
one manual snapshot. Either way, take your own dumps.

### One genuine consolidation argument

You already use Supabase for file storage (`techbox` and `job-resumes`
buckets, `lib/supabase-storage.ts`). Moving the database there puts
everything behind one dashboard and one set of credentials, and gives you
1 GB of file storage on the same free plan. That has real day-to-day value
even setting the quota question aside.

### Verdict

**Check which meter is at 91% first.** Then:

- Compute → **migrate, Supabase is better for your case**
- Storage or transfer → **do not migrate**, it will not help; fix §2 instead

---

## 4. Your migration risk is low

I checked the things that usually make a Postgres migration painful:

| Check | Result |
|---|---|
| Neon-specific driver | **None.** No `@neondatabase/serverless`, no `@vercel/postgres`. Plain Prisma over TCP. |
| Extensions | `pg_trgm` only — **supported by Supabase** |
| Postgres version | 17.10 → Supabase offers 17 |
| Schemas | `public` + `neon_auth` |
| Data volume | 15 MB — dumps and restores in seconds |
| Code changes needed | **Two environment variables** |

**`neon_auth` is dead weight.** It holds 488 kB of Better-Auth scaffolding
(`user`, `session`, `organization`, `jwks`, `project_config`) and **is
referenced nowhere in your codebase** — verified by grep across all `.ts`,
`.tsx`, `.prisma` and `.json`. Your auth is your own, in `lib/auth-server.ts`
with `jose`. Do not migrate this schema. Note also that Supabase reserves
its own `auth` schema, so leaving it behind avoids any confusion.

---

## 5. How to migrate

Total time: about 30 minutes. Nothing is deleted from Neon, so you can
abort at any point.

### Step 1 — Take a backup first

You need `pg_dump` version 17. On Windows, install the PostgreSQL 17
client tools from postgresql.org (during setup you can untick the server
and keep only "Command Line Tools").

Use the **DIRECT_URL** (non-pooled) for dumps — poolers do not reliably
support the full protocol `pg_dump` needs:

```bash
pg_dump "postgresql://neondb_owner:PASSWORD@ep-twilight-hall-atc6iest.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require" ^
  --schema=public ^
  --no-owner ^
  --no-privileges ^
  --file=techbox-backup.sql
```

`--schema=public` excludes `neon_auth`. `--no-owner` and `--no-privileges`
strip Neon-specific role grants that would fail on Supabase.

**Verify the dump before continuing:**

```bash
findstr /C:"CREATE TABLE" techbox-backup.sql | find /C "CREATE TABLE"
```

Expect **38** tables. Fewer means the dump is incomplete — stop and retry.

### Step 2 — Create the Supabase project

Choose a region close to your Vercel deployment. Yours runs in `iad1`
(`vercel.json`), so pick **East US** to keep latency low. Save the database
password Supabase shows you — it is displayed once.

### Step 3 — Restore

Supabase gives you two connection strings. Use the **direct** one
(port 5432) for the restore, not the pooled one (port 6543):

```bash
psql "postgresql://postgres:PASSWORD@db.YOURPROJECT.supabase.co:5432/postgres?sslmode=require" ^
  --file=techbox-backup.sql
```

`CREATE EXTENSION pg_trgm` is in your migration history and Supabase allows
it, so the trigram indexes rebuild automatically.

### Step 4 — Point the app at Supabase

Supabase's pooler is on port **6543** in transaction mode; direct is
**5432**. Prisma needs both, and transaction-mode pooling requires
`pgbouncer=true`:

```env
DATABASE_URL="postgresql://postgres.YOURPROJECT:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
DIRECT_URL="postgresql://postgres:PASSWORD@db.YOURPROJECT.supabase.co:5432/postgres?sslmode=require"
```

Two things that will bite you if you skip them:

- **`pgbouncer=true` is mandatory.** Without it Prisma tries to use
  prepared statements, which transaction-mode PgBouncer does not support.
  You get intermittent `prepared statement "s0" already exists` errors that
  look random and are miserable to debug.
- **`DIRECT_URL` must be the 5432 host.** Migrations cannot run through a
  transaction pooler.

### Step 5 — Verify before switching production

```bash
pnpm db:doctor
```

This is exactly what that tool is for. It will confirm DNS, TCP, TLS, a
live query, and that all **38 models** are present. Then:

```bash
pnpm prisma migrate status
pnpm test
```

Compare row counts against the numbers at the top of this document —
164 posts, 23 users — before you trust the new database.

### Step 6 — Update Vercel

Set `DATABASE_URL` and `DIRECT_URL` in the Vercel dashboard, then redeploy.
**Keep the Neon project alive for a week** in case you need to roll back.
Rolling back is just putting the old two variables back.

---

## 6. What does not change

- No code changes. No `lib/db.ts` edits, no schema edits.
- `pnpm db:doctor`, `lib/db-error.ts` and the `ipv4first` fix all work
  identically — they are provider-agnostic.
- Supabase Storage is untouched; the buckets stay where they are.
- The `PRISMA_CONNECTION_LIMIT` logic in `lib/db.ts` still applies. Keep
  `connection_limit=1` in the pooled URL for serverless.

---

## 7. Honest summary

Migrating is low-risk and about 30 minutes of work, and consolidating onto
one provider you already use has real value.

But **it may not solve your problem**, and I would be doing you a
disservice not to say so plainly. Your data is 15 MB against a 500 MB cap.
If the 91% is storage, then moving 15 MB into an identically-sized 500 MB
box accomplishes nothing, and the real cause is still out there. If it is
compute hours, Supabase genuinely fixes it — that meter does not exist
there.

Check the dashboard, find out which bar it is, then decide.
