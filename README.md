# The Straight Path (الصراط المستقيم)

A mobile-first Islamic research and dawah library for readers from all
backgrounds. The site presents sourced articles about Islam, Christianity,
atheism, common claims against Islam, and Palestine in a respectful, clear,
pro-Islam voice.

## Architecture

- Next.js App Router, React, TypeScript, and Tailwind CSS provide the website.
- Payload CMS is embedded in the Next.js application and uses SQLite in the
  current deployment.
- `lib/content/` is the application-facing content boundary. Pages and shared
  components should not query editorial storage directly.
- Payload owns articles, comparison articles, citations, scripture, glossary,
  source-library records, users, and consented analytics events.
- Navigation, category structure, and research trees remain code-defined under
  `data/` and flow through `lib/content/`.
- `content-drafts/*.json` is reviewed import material for Payload, not a second
  live content source.
- `mobile/` is an Expo application that consumes the same approved content
  contracts and bundles an offline snapshot.

## Local development

Requirements: Node.js 22 and npm.

```powershell
npm ci
npm run dev
```

The site runs at `http://localhost:4173`. Create a local `.env` from
`.env.example` and use a new local `PAYLOAD_SECRET`; never copy the production
environment file into the repository.

## Verification

For ordinary web or content changes run:

```powershell
npm run typecheck
npm run lint
npm run verify:drafts
npm run verify:key-scripture
npm run verify:quran -- .codex-quran-audit/quran-uthmani.json
npm run build
```

The Quran verifier requires a canonical Tanzil Uthmani source file. An optional
second argument can verify the stored English translation against the approved
Saheeh International source.

For a running target:

```powershell
npm run smoke:test -- http://localhost:4173
```

The website's article reader uses male neural audio only. If audio is slow or
unavailable it stays on Preparing and retries with backoff, respecting
`Retry-After`; Cancel/Stop aborts loading and retries. It never switches to a
browser/device voice.

The bottom Back button restarts the current paragraph after its first second;
within that first second it goes to the previous paragraph. Rapid skips cancel
obsolete requests and load only the final selection, with at most one upcoming
chunk preloaded. Completed audio is reused. Standalone source links remain
visible and copyable but are omitted from narration. Server synthesis is
cancellable, cached with bounded memory, and retried if its deadline expires.

Exercise the reader's failure and recovery paths with:

```powershell
node scripts/verify-neural-reader.mjs http://localhost:4173
npx --no-install tsx scripts/verify-neural-tts.ts
```

This browser regression check intercepts TTS requests in isolated test contexts;
also verify real neural playback against the deployed site before release.

For the Expo application:

```powershell
Set-Location mobile
npm ci
npm run lint
npx expo install --check
```

## Main directories

```text
app/                  Next.js frontend, Payload admin/API, health, TTS, analytics
components/           Shared layout, content, audio, analytics, and UI components
content-drafts/       Reviewed JSON import material for Payload
data/                 Code-defined navigation plus legacy/seed evidence
lib/content/          Application-facing content boundary
payload/              Collections, hooks, imports, and verification tools
mobile/               Expo client and bundled offline content snapshot
scripts/              Smoke, scripture, export, and integrity checks
types/                Shared domain and generated Payload types
```

## Editorial workflow

The admin interface is available at `/admin`. Editorial status and source
status are meaningful controls:

- Article states: Draft, Under review, Published.
- Citation and scripture states: Source pending, Verified.
- The publish hook rejects placeholder markers and unverified linked evidence.
- Do not weaken the publish hook or mark evidence verified merely to pass a
  build.

See [CONTENT-EDITING.md](CONTENT-EDITING.md) for content operations and
[DEPLOYMENT.md](DEPLOYMENT.md) for the isolated release, backup, health-check,
and rollback procedure.

## Public application

- Canonical site: `https://thestraightpathislam.com`
- Health: `/healthz`
- Database readiness: `/api/health`
- Long-form articles: `/articles/[slug]`
- Search: `/search`
- Glossary: `/glossary`
- Claims Against Islam: `/claims-against-islam`

The website includes responsive English/Arabic reading, RTL handling, theme
selection, article audio, offline navigation fallback, consent-gated first-party
analytics, searchable content, and source-linked scripture cards.
