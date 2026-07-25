# Security policy

## Supported version

Security fixes are applied to the latest commit on `main`. Older commits,
forks, local modifications, and unofficial deployments are not supported.

## Reporting a vulnerability

Please report suspected vulnerabilities privately. Prefer GitHub's **Private
vulnerability reporting** for this repository when it is available. If it is
not available, contact the TechBox maintainers through the private contact
method published by the organization/site.

Do **not** open a public issue or discussion containing:

- exploit steps or proof-of-concept payloads;
- credentials, access tokens, session/capability tokens, or private URLs;
- customer, applicant, order, support, or account personal data;
- unpatched vulnerability details.

Include the affected route/component and commit, impact, prerequisites,
reproduction steps using non-production data, and any suggested mitigation.
Do not access, modify, retain, or download data that is not yours. Stop testing
if it could disrupt production, payment, email, database, or storage services.

Maintainers will validate the report, determine severity and remediation, and
coordinate disclosure after a fix is available. Response and resolution times
depend on impact and reproducibility; this policy does not promise a fixed
bounty or timeline.

## Credential exposure

A credential pasted into chat, an issue, a log, or Git history is considered
compromised even if it is later deleted. Revoke/rotate it at the provider first,
then update the required deployment environments and review provider audit
logs. Rotating `AUTH_SECRET` invalidates all existing TechBox sessions.

The Supabase service-role key, database URLs, payment credentials, email keys,
chat keys, cron secret, Upstash token, and Sentry auth credentials are
server-only. They must never use a `NEXT_PUBLIC_` prefix.

## Operational security documentation

The access-control and privacy model is documented in
[docs/security-and-privacy.md](docs/security-and-privacy.md). Credential,
migration, payment, and incident procedures are in
[docs/operations.md](docs/operations.md).
