# The Straight Path demo deployment

## Classification

`WEBSITE_API_MOBILE`: the repository contains a Next.js website, Payload CMS
REST/admin routes backed by SQLite, and an Expo mobile application. The web and
API run in one container; the mobile build remains a separate release artifact.

## Isolated demo resources

- Slug: `the-straight-path`
- Web service: `the-straight-path-web`
- Internal port: `4173`
- Persistent storage: `/app/data` mounted from a uniquely named volume
  `the-straight-path-sqlite-data`
- Canonical web domain: `https://thestraightpathislam.com`
- Legacy web domain (permanent redirect):
  `https://the-straight-path.169.58.54.165.sslip.io`
- API domain: `https://api-the-straight-path.169.58.54.165.sslip.io`
- Liveness: `/healthz`
- Database readiness: `/api/health`
- Initial limit: 1 CPU and 1.5 GB memory
- Runtime variables: `PAYLOAD_SECRET`, `DATABASE_URI`, `NEXT_PUBLIC_SITE_URL`,
  `HOSTNAME`, and `PORT`

The API is part of the web service, so both public domains route to the same
container and port. No database or cache port is published.

## Coolify application settings

Create project `the-straight-path`, environment `demo`, and a Dockerfile-based
application sourced from an immutable commit of this repository.

- Dockerfile: `/Dockerfile`
- Port: `4173`
- Persistent storage: named volume `the-straight-path-sqlite-data` mounted at
  `/app/data`
- Health check: `/api/health`
- Restart policy: `unless-stopped`
- Limits: 1 CPU and 1536 MB memory
- `PAYLOAD_SECRET`: secret, randomly generated in Coolify
- `DATABASE_URI`: `file:/app/data/payload.db`
- `NEXT_PUBLIC_SITE_URL`: `https://thestraightpathislam.com`
- `HOSTNAME`: `0.0.0.0`
- `PORT`: `4173`

Assign the canonical, `www`, legacy web, and API domains to port 4173. Redirect
the legacy web domain and `www` permanently to the canonical apex domain. Do
not publish a host port for SQLite.

## Verification

Before switching the web service, query the candidate release's
`/api/content-manifest` endpoint. Do not continue when the public counts for
articles, citations, Quran verses, Bible verses, or glossary terms are zero.
That means the database contains only reviewed/pending records, which the
public access rules correctly hide. Publication and verification must be
completed through Payload's editorial workflow; never bypass those controls to
make a deployment pass.

## Reviewed content releases

Do not run the generic `content-sync` import against public records. Its
`--status=reviewed` import is for editorial staging and resets scripture to
pending. It is not a publication or approval command.

For an explicitly owner-authorized content release, use
`payload/publish-approved-release.ts` with an immutable evidence manifest.
The default command is a SQLite read-only preflight; it does not initialize
Payload, push a schema, or change records:

```bash
npx --no-install tsx payload/publish-approved-release.ts \
  --manifest=data/release-evidence/<release>/manifest.json \
  --output=/tmp/the-straight-path-<release>-content-plan.json
```

Every article approval binds the exact parsed draft hash. Every pending or
changed source needs a checked evidence artifact bound to its exact content
hash. Bibliographic identity checks do not certify unread quotations or every
argument in a book. Unresolved source requirements block the entire release
before mutation. A real stored owner is mandatory; never manufacture an owner
principal or mark evidence verified merely to make this preflight pass.

After a consistent, integrity-checked server SQLite backup and a successful
isolated rehearsal, apply only the approved plan hash under `NODE_ENV=production`:

```bash
NODE_ENV=production npx --no-install tsx payload/publish-approved-release.ts \
  --manifest=data/release-evidence/<release>/manifest.json \
  --apply --plan-hash=<exact-successful-preflight-hash>
```

This preserves normal Payload access rules and publication hooks. Individually
verified source changes commit in one transaction, followed by article/related
link publication in a second transaction. If the article phase fails, genuinely
verified sources remain committed but article changes roll back; inspect the
result and obtain a fresh read-only plan before retrying. Never blindly restore
the database over a running service. Private backup and plan files must not be
committed or exposed publicly. Unused placeholders and retired redirects remain
unpublished.

The short-lived approved publisher sets connection-local `cache_spill=OFF`
before **each** transaction and verifies it on the registered transaction
session. This defers SQLite's exclusive read lock until commit; it does not
change the persistent journal mode, schema, web configuration, or publish
gates. Allow sufficient memory for retained dirty pages and verify anonymous
content/health reads during the operation. A short read pause can still occur
at commit. SQLite still permits only one writer: analytics, login/session and
admin writes can be unavailable for the entire publication transaction. Plan
and communicate this temporary write freeze; do not promise zero downtime or
replace the live database with a copy that would discard concurrent records.

Run the release smoke suite from outside the VPS with the public-content gate:

```powershell
npm run smoke:test -- https://thestraightpathislam.com --require-content
```

Also check the admin login page at `/admin`, a direct article refresh, the
mobile layout, the browser console, and the TTS endpoint with a short sample.

## Backup

Before an application upgrade, create a timestamped copy of the named volume
using Coolify's volume backup facility or stop only this application and copy
`/app/data/payload.db` to protected backup storage. Never copy or stop another
project's volume. Record the backup timestamp and verify that the copy is
non-empty before redeploying.

## Rollback

1. Record the current working commit before release.
2. Back up `the-straight-path-sqlite-data`.
3. In Coolify, select the previous successful immutable commit and redeploy.
4. Keep the existing named volume attached; do not delete or recreate it.
5. Run the smoke test and `/api/health` check after rollback.

Payload schema changes require a tested restore plan before release. This
initial deployment does not include a destructive migration.
