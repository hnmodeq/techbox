# Contributing to TechBox

TechBox is proprietary software. A public repository does not grant a license
to copy, deploy, or redistribute it. Contributions are accepted only at the
maintainers' discretion and are governed by [LICENSE](LICENSE).

## Workflow

1. Discuss significant product, schema, payment, auth, storage, or dependency
   changes with a maintainer before implementation.
2. Branch from the latest `main` and keep commits focused.
3. Preserve the Persian RTL experience and existing module configuration.
4. Add or update tests for behavior, permissions, privacy, pricing, and
   regressions.
5. Open a pull request describing user impact, security/privacy impact,
   migrations, environment changes, rollback constraints, and verification.
6. Do not merge while a required CI job is failing.

## Local checks

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
```

Run `pnpm build` when local resources permit; GitHub Actions is the release
source of truth for the production build and complete E2E suite.

## Database changes

- Change `prisma/schema.prisma` and add a new Prisma migration.
- Never edit a migration that has been applied in any shared environment.
- Never use `prisma db push` as a production deployment procedure.
- Make data migrations bounded, reviewable, and idempotent where practical.
- Document the exact deploy/resolve/backfill command and rollback limitation.
- Do not add application-time DDL.

## Security and privacy

- Never commit or paste credentials, `.env` files, production identifiers,
  personal data, capability tokens, or private storage URLs.
- Treat browser data as untrusted. Enforce identity, ownership, RBAC,
  publication state, pricing, and payment state on the server.
- Use bounded Zod schemas for inputs and explicit DTO/select objects for
  outputs.
- Protect public writes with an appropriate rate-limit bucket.
- Use private/no-store responses for identity, admin, order, support, résumé,
  and capability data.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- Keep the QNAP importer gated by `QNAP_ASSET_IMPORT_AUTHORIZED=true` and do
  not add unapproved asset sources.
- Report vulnerabilities privately under [SECURITY.md](SECURITY.md).

## UI, accessibility, and SEO

- Use semantic headings, labels, keyboard interaction, visible focus, and
  reduced-motion behavior.
- Test narrow/mobile layouts and Persian RTL direction, including logical
  start/end spacing.
- Use the canonical metadata helpers in `lib/seo.ts`; do not add localhost or
  staging canonical fallbacks.
- Respect runtime module enablement in navigation, sitemap, RSS, and home rows.
- Reuse the existing shared UI and domain calculators rather than introducing
  duplicates.

## Generated and scratch files

Do not commit `.next`, `node_modules`, Playwright reports, test results,
coverage, uploads, local databases, editor backups, production exports, or
one-off command transcripts. Keep intentional planning notes clearly named and
free of secrets.
