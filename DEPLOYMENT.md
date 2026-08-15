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

Run from outside the VPS:

```powershell
npm run smoke:test -- https://thestraightpathislam.com
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
