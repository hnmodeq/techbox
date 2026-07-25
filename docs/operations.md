# TechBox operations runbook

This runbook covers the production stack: Vercel, Neon PostgreSQL, Prisma,
Supabase Storage, Upstash Redis, Sentry, Resend/email, and Zarinpal.

## 1. Environment contract

Configure secrets independently for development, Vercel Preview, Vercel
Production, and GitHub Actions. Never copy a production secret into source,
workflow YAML, build output, tickets, or chat.

Production-critical values:

- `AUTH_SECRET`: at least 32 characters. Rotation invalidates all sessions.
- `NEXT_PUBLIC_SITE_URL`: the exact public HTTPS origin. The production build
  intentionally fails for localhost, HTTP, malformed, or missing values.
- `DATABASE_URL`: Neon pooled URL with SSL and conservative serverless pooling,
  normally `connection_limit=1&pool_timeout=15&connect_timeout=15`.
- `DIRECT_URL`: Neon non-pooled URL used for migrations.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`: server-only Supabase access.
- `SUPABASE_PUBLIC_BUCKET=techbox` and
  `SUPABASE_PRIVATE_BUCKET=job-resumes`.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`: distributed rate
  limiting. Missing values produce a production-critical log warning.
- `ZARIN_MERCHANT_ID`: live Zarinpal checkout.
- `CRON_SECRET`: scheduled-publishing bearer token.

The Supabase service-role key and chat/payment/email credentials must never use
a `NEXT_PUBLIC_` prefix.

GitHub Actions optional integrity checks use repository secrets
`DATABASE_URL`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY`, plus repository
variables `SUPABASE_PUBLIC_BUCKET` and `SUPABASE_PRIVATE_BUCKET`.

## 2. Release sequence

1. Confirm `main` contains only reviewed changes and no generated artifacts.
2. Run deterministic checks locally when resources permit:

   ```bash
   pnpm install --frozen-lockfile
   pnpm lint
   pnpm typecheck
   pnpm test
   ```

3. Inspect migration state against the intended database:

   ```bash
   pnpm exec prisma migrate status
   ```

4. Apply pending committed migrations:

   ```bash
   pnpm db:migrate:deploy
   ```

5. Push to `main` and wait for all deterministic GitHub Actions jobs: Lint,
   Typecheck, Unit Tests, Build, and E2E Tests.
6. Inspect the optional DB/content/storage job even though it is
   non-blocking.
7. Wait for the Vercel deployment attached to the same commit.
8. Perform the post-deploy checks below.

Do not use `prisma db push` in production. Do not edit migration SQL after it
has been applied.

## 3. Post-deploy verification

- `GET /api/healthz` returns HTTP 200 and reports a healthy database.
- The homepage, public module pages, search, and representative detail pages
  render without hydration or image errors.
- `/admin/login` renders; an unprivileged account cannot access admin APIs.
- `/shop/checkout` renders the real cart flow.
- Create only a controlled test order; verify server-side repricing and the
  configured Zarinpal environment before completing payment.
- A guest order cannot be read or paid without its capability token.
- A signed-in user can read only their own orders and support tickets.
- A résumé object is not publicly accessible; only a staff account with
  `job:application:view` can stream it through the admin API.
- Canonical, Open Graph, sitemap, robots, and RSS URLs use the production
  origin.
- Sentry, Vercel logs, Neon metrics, Supabase logs, and Upstash metrics show no
  new sustained error pattern.

## 4. Database incidents and migrations

### PostgreSQL `57P01`

`57P01: terminating connection due to administrator command` means PostgreSQL,
the managed compute endpoint, or an administrator terminated the session. A
short burst can occur during maintenance or failover.

If it persists:

1. Check Neon compute/operations status and recent restarts.
2. Confirm runtime uses the pooled `-pooler` host and migrations use the direct
   host.
3. Confirm the runtime URL has `connection_limit=1` unless higher capacity was
   deliberately tested.
4. Redeploy so stale serverless pools are discarded.
5. Recheck `/api/healthz`, credentials, SSL, network restrictions, and Neon
   connection limits.

Do not silence Prisma error logging to hide repeated connection failures.

### Failed migration

1. Stop repeated deploy attempts.
2. Record the Prisma error and inspect both the migration SQL and actual schema.
3. Back up affected production data before manual repair.
4. Apply or revert the missing SQL deliberately.
5. Use `prisma migrate resolve --applied <migration>` only when every operation
   in that migration is already present. Use `--rolled-back` only when it is
   safe for Prisma to execute the migration again.
6. Run `prisma migrate status`, integrity checks, and a deployment verification.

Migration resolution changes Prisma's history record; it does not execute the
migration's missing statements.

## 5. Supabase Storage

Expected buckets:

- `techbox`: public editorial and product media.
- `job-resumes`: private résumé files.

Routine integrity check:

```bash
pnpm check:storage
```

Private résumé migration:

```bash
pnpm storage:migrate-resumes       # preview
pnpm storage:migrate-resumes -- --apply
```

QNAP recovery/import is intentionally gated and must stay gated:

```bash
# Set only after asset-use authorization has been confirmed.
QNAP_ASSET_IMPORT_AUTHORIZED=true pnpm storage:import-qnap -- --apply
```

The importer is idempotent and records source/page trace in `AuditLog`. Do not
remove the gate or import from unapproved sources.

Retired content cleanup is also idempotent:

```bash
pnpm content:remove-retired
pnpm content:remove-retired -- --apply
```

The approved retired download posts, media item, review, and their owned
objects must remain absent while the download center is disabled.

## 6. Payment incident handling

- Confirm production does not set `ZARINPAL_SANDBOX=true`.
- Never mark an order `paid` from the general admin status endpoint.
- Match callback authority to the authority stored for that exact order.
- Treat gateway code `101` as an already-verified idempotent result.
- Use the gateway and database records together when investigating disputes;
  do not trust customer-provided totals or browser state.
- Restrict refunds and fulfilment transitions to staff with the corresponding
  order permissions and preserve audit evidence.

## 7. Credential incident handling

If a credential is pasted, logged, committed, or otherwise exposed:

1. Revoke/rotate it immediately at the issuing provider.
2. Remove it from current files and deployment variables where no longer used.
3. Review provider audit logs for use after exposure.
4. Replace it independently in each required environment.
5. Redeploy/restart affected services.
6. For an exposed `AUTH_SECRET`, rotate it and expect every user to be signed
   out.
7. If a secret entered Git history, treat deletion from the latest commit as
   insufficient. Rotate first, then coordinate history rewriting and downstream
   clone/cache cleanup.

## 8. Rollback

- Prefer a forward fix when a migration has already changed production data.
- A Vercel code rollback does not roll back Neon schema or Supabase objects.
- Before reverting code, verify it remains compatible with the current schema.
- Never reverse payment state or delete orders as part of a generic deploy
  rollback.
- Record the affected commit, deployment, migration state, impact window, and
  follow-up action.
