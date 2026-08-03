# TechBox (تکباکس)

[![CI](https://github.com/hnmodeq/techbox/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/hnmodeq/techbox/actions/workflows/ci.yml)

TechBox is a Persian, right-to-left technology platform for infrastructure,
networking, servers, storage, and security. It combines editorial content,
news, video, reviews, a forum, technical calculators, a real shop and payment
flow, jobs, support tickets, user accounts, and an RBAC-protected
administration area.

The application is built with **Next.js 16 App Router**, **React 19**,
**TypeScript**, **Tailwind CSS v4**, **Prisma 6 + Neon PostgreSQL**,
**Supabase Storage**, **Upstash Redis**, **Sentry**, and **Vercel**.

> The download module remains in the product code but is currently disabled in
> production configuration. Retired download records and sample files must not
> be reintroduced unless the module is deliberately relaunched.

## Product and architecture

- `app/` contains public pages, private account/admin segments, and route
  handlers under `app/api/`.
- `features/` contains domain-oriented UI and client logic.
- `components/` contains shared layout, accessibility, SEO, and UI primitives.
- `lib/` contains server policy, auth, storage, pricing, SEO, data, and domain
  helpers.
- `config/modules.config.ts` and `lib/module-config.ts` define module metadata
  and runtime module visibility.
- `prisma/schema.prisma` and `prisma/migrations/` are the database source of
  truth. Production schema changes use migrations, not `prisma db push`.
- A universal `Post` model powers the editorial, forum, download, review, and
  shop modules. Timeline, orders, jobs, support, identity, and RBAC have
  dedicated models.

The browser never supplies authoritative shop prices. Checkout reloads products
and pricing inputs from PostgreSQL, and order/payment reads require account
ownership, an administrative permission, or a hashed guest capability token.
Browser identity comes from the HTTP-only `tb_session` cookie and
`/api/auth/me`; local storage is not an identity authority.

See [operations](docs/operations.md) and
[security/privacy architecture](docs/security-and-privacy.md) for deployment
and access-control details.

## Requirements

- Node.js 20 or newer
- pnpm 10.12.1 (declared by `packageManager`)
- PostgreSQL/Neon for database-backed features
- A Supabase project with:
  - public bucket `techbox`
  - private bucket `job-resumes`

## Local setup

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env
pnpm exec prisma generate
pnpm db:migrate:deploy
# Optional development/demo data:
pnpm db:seed
pnpm db:seed-roles
pnpm dev
```

The development server is available at `http://localhost:3000` by default.
Use a disposable development database; do not point local seed or cleanup
commands at production accidentally.

## Environment variables

Use `.env.example` as the template. Never commit `.env` files or paste live
secrets into issues, logs, prompts, or documentation.

### Required for production

| Variable | Purpose |
| --- | --- |
| `AUTH_SECRET` | Session-signing secret, at least 32 characters. Generate independently per environment. |
| `NEXT_PUBLIC_SITE_URL` | Exact canonical public HTTPS origin, with no Markdown or path. Production rejects missing, local, malformed, or HTTP values. |
| `DATABASE_URL` | Neon pooled runtime URL. Keep `connection_limit=1` unless measured capacity supports more. |
| `DIRECT_URL` | Neon direct/non-pooled URL for Prisma migrations. |
| `SUPABASE_URL` | Supabase project origin. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only storage credential. **Never** use a `NEXT_PUBLIC_` prefix. |
| `SUPABASE_PUBLIC_BUCKET` | Public content bucket; normally `techbox`. |
| `SUPABASE_PRIVATE_BUCKET` | Private résumé bucket; normally `job-resumes`. |
| `ZARIN_MERCHANT_ID` | Zarinpal merchant ID for live checkout. |
| `CRON_SECRET` | Bearer secret for scheduled publishing. |

### Recommended or feature-specific

| Variable | Purpose |
| --- | --- |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Distributed production rate limiting. Without them, only a per-process development fallback exists. |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_EMAIL` | Transactional email and operational recipients. |
| `CHAT_API_KEY`, `CHAT_BASE_URL`, `CHAT_MODEL` | OpenAI-compatible assistant backend. The API key stays server-side. |
| `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT` | Browser/server error monitoring and source-map integration. |
| `ZARINPAL_SANDBOX` | Set to `true` only in explicit non-production payment testing. |
| `PRISMA_CONNECTION_LIMIT` | Runtime fallback when `DATABASE_URL` has no `connection_limit`; defaults to `1`. |
| `QNAP_ASSET_IMPORT_AUTHORIZED` | One-time safety gate for the QNAP importer. It must remain `false` unless asset-use authorization has been confirmed. |

Rotating `AUTH_SECRET` invalidates all existing sessions and signs users out.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the development server. |
| `pnpm build` / `pnpm start` | Build and serve the production application. |
| `pnpm lint` | Run ESLint. |
| `pnpm typecheck` | Generate Next route types and run TypeScript without emitting files. |
| `pnpm test` | Run the complete Vitest unit suite. |
| `pnpm test:e2e` | Run the complete Playwright suite. |
| `pnpm test:smoke` | Run only the public smoke specification. |
| `pnpm db:migrate:deploy` | Apply committed Prisma migrations. This is the production schema command. |
| `pnpm db:seed`, `pnpm db:seed-roles` | Seed development/application data and canonical RBAC roles. |
| `pnpm check:content` | Validate content integrity. |
| `pnpm check:db` | Validate database integrity. |
| `pnpm check:storage` | Validate stored URLs and Supabase objects. |
| `pnpm check:all` | Run all three integrity checks. |
| `pnpm storage:migrate-resumes` | Migrate legacy résumé objects to private Supabase storage. |
| `pnpm storage:import-qnap -- --apply` | Import authorized official QNAP assets; requires the explicit authorization gate. |
| `pnpm content:remove-retired -- --apply` | Idempotently remove the approved retired records and their owned storage objects. |

Commands that accept `--apply` default to a non-destructive preview. Review the
preview and the target environment before applying.

## Storage and private data

- Public editorial/product objects use the public Supabase bucket.
- Résumés use opaque `supabase://bucket/path` references in PostgreSQL and are
  streamed only by the permission-protected admin endpoint.
- Support and guest-order capabilities are returned once to the client and only
  one-way hashes are stored.
- Public content DTOs remove procurement costs, exchange adjustments, and
  seller-margin inputs.

## Database migrations

There are 23 committed migration directories: the `0_init` baseline plus
migrations through `20260803000021_timeline_user_identity`.

```bash
# Inspect first
pnpm exec prisma migrate status

# Apply pending committed migrations
pnpm db:migrate:deploy
```

Never edit an already-applied migration and never use `prisma db push` against
production. If Prisma reports a failed migration, inspect the database and the
migration SQL before using `prisma migrate resolve`; resolution records state
and does not execute missing SQL.

## CI and deployment

`.github/workflows/ci.yml` runs on every push and pull request to `main`:

1. Lint
2. Typecheck
3. Unit Tests
4. Production Build
5. Complete Playwright E2E Tests
6. Optional DB/content/storage checks when repository secrets are configured

The optional integrity job is informational so a transient external database
or storage outage does not hide the status of the deterministic build/test
jobs. Its logs still need review before release.

Vercel deployment must use the same production environment contract described
above. Apply pending migrations, confirm the canonical HTTPS origin, deploy,
then verify `/api/healthz`, checkout/payment, private résumé access, and the
latest CI/deployment status. See [docs/operations.md](docs/operations.md).

## Security and contributions

Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).
Do not open a public issue containing credentials, personal data, or exploit
details. Contribution and migration rules are in
[CONTRIBUTING.md](CONTRIBUTING.md).

## License

Copyright © TechBox / هونامیک ارتباط رستاک. All rights reserved. This is
proprietary software; public source availability does not grant permission to
copy, modify, redistribute, or deploy it. See [LICENSE](LICENSE).
