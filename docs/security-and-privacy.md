# Security and privacy architecture

This document records the server-enforced trust boundaries for TechBox. Client
components, hidden navigation, and the `/admin` proxy improve UX but are not
authorization controls. Every sensitive route must enforce its own policy.

## Identity and sessions

- `tb_session` is an HTTP-only, `SameSite=Lax` JWT cookie. It is `Secure` in
  production and scoped to `/`.
- `AUTH_SECRET` is mandatory and must contain at least 32 characters.
- The JWT subject is resolved to a current database user on every privileged
  request. Missing, invalid, expired, revoked, banned, or suspended sessions
  are rejected.
- `sessionsInvalidatedAt` revokes older JWTs after password changes/resets.
- Browser identity is loaded from `/api/auth/me`. Local storage and browser
  request bodies are never identity authorities.
- Changing an account's recovery email requires the current password and
  resets email verification.
- Password reset and verification tokens are random, single-use, expiring, and
  stored only as SHA-256 hashes.
- Verification resend responses are intentionally uniform for nonexistent,
  verified, and unverified addresses to prevent account enumeration.

## RBAC

`Role` and `UserRole` are the authoritative staff model. Effective permissions
are calculated server-side. The legacy `User.modules` field can support
compatibility display data but does not grant API access.

- `requirePermission`, `requireAnyPermission`, and `requireAllPermissions`
  protect staff operations.
- `requireStaff` requires at least one effective staff permission unless the
  user is `super_admin`.
- Module operations resolve to `content:<module>:<action>` permissions; shop
  products use the more granular product permission set.
- Non-super administrators cannot assign or remove a role containing a
  permission they do not themselves own.
- Denied staff permission checks are written to the audit log when possible.

## Route access matrix

| Route family | Read policy | Write policy | Sensitive output controls |
| --- | --- | --- | --- |
| Public posts/search/home/modules | Anonymous; published/non-deleted content only | Authenticated forum authors or staff with module permission | Public DTO strips procurement cost, currency adjustment, and margin inputs |
| Comments, likes, ratings, follows, saved content | Public aggregate reads where applicable | Authenticated owner; moderation is permission-protected | Approved comments only on public views |
| Timeline | Anonymous published events and approved comments | Authenticated interactions; event CRUD requires timeline permissions | Unpublished event detail is not returned publicly; admin list requires `content:timeline:view` |
| Auth/profile | Current session only where account data is involved | Rate-limited; password/email changes require re-authentication as applicable | Password hashes are never selected by general session APIs |
| Orders | Account owner, permitted staff, or exact guest capability | Creation is rate-limited and server-repriced; fulfilment requires order permission | Private/no-store; guest capability stored only as a hash |
| Zarinpal payment | Exact order authority/state | Owner/capability starts payment; only verified gateway response marks paid | Gateway authority is bound to one order; browser totals are ignored |
| Support tickets | Signed-in matching account or exact ticket capability | Owner/capability; staff replies require inbox permission | Private/no-store; capability hash omitted from responses |
| Job applications | Public, rate-limited submission to an active job | Staff status operations require job permission | Résumés are private Supabase objects streamed only through `job:applications`; direct legacy public URLs are rejected |
| Admin APIs | No anonymous access | Explicit RBAC permission for every operation | Private/no-store where user, order, audit, storage, or operational data is returned |
| Scheduled publishing | No public list | Valid cron bearer secret or authorized staff | Fails closed if no authorization is present |
| Storage administration/upload | None public beyond normal public media URLs | `blob:view` / `blob:upload` permissions | Service-role credential remains server-only |

## Capability tokens

Guest orders and support tickets need access before a user necessarily has an
account. Their capability token is a bearer credential:

- generated from cryptographically secure random bytes;
- returned only when the protected record is created;
- stored in PostgreSQL only as a one-way SHA-256 hash;
- compared using timing-safe verification;
- required in addition to the record identifier for guest reads/actions.

Capability tokens must not be logged, placed in analytics events, or sent to a
third party. They can appear in the returning customer's URL where required;
such pages are no-index and private responses are no-store.

## Shop and payment invariants

- Order item schema accepts only product slug and quantity, not browser prices.
- Product availability and authoritative unit price are reloaded from
  PostgreSQL.
- Quantity and line count limits are server-enforced.
- Administrative status changes cannot create the `paid` state.
- Zarinpal verification matches the callback authority to the authority stored
  for the exact pending order and uses the stored total.
- Payment updates are conditional/idempotent, including already-verified
  gateway responses.

## Personal and private data

- Public user DTOs contain only fields deliberately selected for display.
- Order contact/address data is available only to the owner/capability holder
  or permitted staff.
- Verification requests, job applications, support messages, audit logs, and
  admin analytics are permission-protected.
- Résumé references use `supabase://<private-bucket>/<path>` and are never
  exposed as direct/signed URLs in application-list responses.
- Public content hides internal source price, exchange adjustment, and seller
  benefit fields.
- Public timeline and comment queries filter unpublished/unapproved records.

## Storage boundaries

- `techbox` is the public media bucket.
- `job-resumes` is private.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be named with a
  `NEXT_PUBLIC_` prefix.
- Upload endpoints validate permission, path/type/size constraints, and use
  server-held credentials.
- The résumé streaming endpoint accepts only opaque references to the
  configured private bucket. Legacy public résumé URLs receive HTTP 410 and
  must be migrated with `pnpm storage:migrate-resumes -- --apply`.
- The QNAP importer remains disabled unless
  `QNAP_ASSET_IMPORT_AUTHORIZED=true` is explicitly set after authorization is
  confirmed.

## Abuse prevention and transport

- Authentication, comments, likes/follows, uploads, chat, views, jobs,
  contact/support, password reset, newsletter, search, profile, and orders have
  rate limits.
- Upstash provides distributed production limits. The in-memory fallback is
  suitable only for development because serverless processes do not share it.
- Production sends HSTS, frame denial, MIME sniffing prevention, a restrictive
  permissions policy, referrer policy, and Content Security Policy headers.
- Remote server fetch helpers reject local/private addresses, credentials in
  URLs, unsafe protocols, and non-allowlisted hosts where applicable.

## Review checklist for a new route

1. Classify the route as public read, authenticated owner, capability, staff
   permission, or cron/system.
2. Enforce that policy in the route handler before accessing sensitive data.
3. Use explicit `select` objects and a dedicated public DTO for public output.
4. Filter publication/moderation/deletion state on anonymous reads.
5. Validate input with bounded schemas and rate-limit public writes.
6. Return private/no-store caching headers for identity, order, support,
   résumé, admin, and capability responses.
7. Avoid raw secrets, tokens, PII, internal prices, and stack traces in logs or
   responses.
8. Add a regression test for ownership, permission denial, redaction, and the
   intended success path.
9. Record operational environment or migration requirements in the runbook.
