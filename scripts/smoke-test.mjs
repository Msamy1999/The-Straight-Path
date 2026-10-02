/* global AbortSignal, console, fetch, process */

const baseUrl = (process.env.BASE_URL ?? process.argv[2] ?? "").replace(/\/$/, "");
const requirePublicContent = process.argv.includes("--require-content");

if (!baseUrl || !/^https?:\/\//.test(baseUrl)) {
  console.error(
    "Usage: npm run smoke:test -- https://your-site.example [--require-content]",
  );
  process.exit(2);
}

const checks = [
  {
    path: "/",
    type: "text/html",
    headers: {
      "x-content-type-options": "nosniff",
      "x-frame-options": "SAMEORIGIN",
      "referrer-policy": "strict-origin-when-cross-origin",
      "strict-transport-security": "max-age=31536000",
    },
  },
  { path: "/healthz", type: "application/json" },
  { path: "/api/health", type: "application/json" },
  { path: "/api/content-manifest", type: "application/json" },
  { path: "/api/search?q=Jesus", type: "application/json" },
  { path: "/api/tts", type: "application/json", status: 400 },
  {
    path: "/api/analytics",
    type: "application/json",
    status: 403,
    method: "POST",
    requestHeaders: { "content-type": "application/json" },
    body: "{}",
  },
  {
    path: "/api/analytics",
    type: "application/json",
    status: 413,
    method: "POST",
    requestHeaders: {
      "content-type": "application/json",
      cookie: "the-straight-path-analytics-consent=granted",
    },
    body: JSON.stringify({ padding: "x".repeat(20_001) }),
  },
  {
    path: "/api/analytics",
    type: "application/json",
    status: 400,
    method: "POST",
    requestHeaders: {
      "content-type": "application/json",
      cookie: "the-straight-path-analytics-consent=granted",
    },
    body: JSON.stringify({
      visitorId: "visitor-1234567890",
      sessionId: "session-1234567890",
      path: "/search?private=query",
      durationMs: 100,
      deviceCategory: "desktop",
      browserCategory: "chrome",
      exitReason: "navigation",
    }),
  },
  {
    path: "/api/analytics",
    type: "application/json",
    status: 400,
    method: "POST",
    requestHeaders: {
      "content-type": "application/json",
      cookie: "the-straight-path-analytics-consent=granted",
    },
    body: "{}",
  },
  { path: "/api/users?limit=1", type: "application/json", status: 403 },
  {
    path: "/api/users/unlock",
    type: "application/json",
    status: 403,
    method: "POST",
    requestHeaders: { "content-type": "application/json" },
    body: JSON.stringify({ email: "unauthorized-unlock-test@example.invalid" }),
  },
  { path: "/api/analytics-events?limit=1", type: "application/json", status: 403 },
  {
    path: "/api/articles?limit=1&where%5Bstatus%5D%5Bnot_equals%5D=published",
    type: "application/json",
    jsonTotalDocs: 0,
  },
  {
    path: "/api/citations?limit=1&where%5Bstatus%5D%5Bnot_equals%5D=verified",
    type: "application/json",
    jsonTotalDocs: 0,
  },
  {
    path: "/api/quran-verses?limit=1&where%5Bstatus%5D%5Bnot_equals%5D=verified",
    type: "application/json",
    jsonTotalDocs: 0,
  },
  {
    path: "/api/bible-verses?limit=1&where%5Bstatus%5D%5Bnot_equals%5D=verified",
    type: "application/json",
    jsonTotalDocs: 0,
  },
  {
    path: "/api/articles",
    type: "application/json",
    status: 403,
    method: "POST",
    requestHeaders: { "content-type": "application/json" },
    body: "{}",
  },
  { path: "/islam-overview", type: "text/html" },
  { path: "/articles/who-is-jesus", type: "text/html" },
  { path: "/articles/contradictions-in-the-bible", type: "text/html" },
  { path: "/claims-against-islam", type: "text/html" },
  { path: "/glossary", type: "text/html" },
  { path: "/search?q=Jesus", type: "text/html" },
  { path: "/privacy", type: "text/html" },
  { path: "/offline", type: "text/html" },
  { path: "/admin", type: "text/html" },
  { path: "/sitemap.xml", type: "application/xml" },
];

let failed = false;

for (const check of checks) {
  try {
    const response = await fetch(`${baseUrl}${check.path}`, {
      redirect: "follow",
      method: check.method ?? "GET",
      headers: check.requestHeaders,
      body: check.body,
      signal: AbortSignal.timeout(20_000),
    });
    const contentType = response.headers.get("content-type") ?? "";
    const expectedStatus = check.status ?? 200;
    const missingHeaders = Object.entries(check.headers ?? {}).filter(
      ([name, value]) => !(response.headers.get(name) ?? "").includes(value),
    );
    const jsonBody =
      check.jsonTotalDocs === undefined ? null : await response.clone().json();
    const jsonOk =
      check.jsonTotalDocs === undefined ||
      jsonBody?.totalDocs === check.jsonTotalDocs;
    const ok =
      response.status === expectedStatus &&
      contentType.includes(check.type) &&
      missingHeaders.length === 0 &&
      jsonOk;
    console.log(
      `${ok ? "PASS" : "FAIL"} ${response.status} ${check.path} ${contentType}${
        missingHeaders.length > 0
          ? ` missing headers: ${missingHeaders.map(([name]) => name).join(", ")}`
          : ""
      }${jsonOk ? "" : ` expected totalDocs=${check.jsonTotalDocs}`
      }`,
    );
    failed ||= !ok;
  } catch (error) {
    failed = true;
    console.error(`FAIL ${check.path} ${error.message}`);
  }
}

if (requirePublicContent) {
  try {
    const response = await fetch(`${baseUrl}/api/content-manifest`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(20_000),
    });
    const manifest = await response.json();
    const requiredCollections = [
      "articles",
      "citations",
      "quran-verses",
      "bible-verses",
      "glossary-terms",
    ];
    const empty = requiredCollections.filter(
      (collection) => !Number.isInteger(manifest?.[collection]?.count) || manifest[collection].count < 1,
    );
    const ok = response.ok && empty.length === 0;
    console.log(
      `${ok ? "PASS" : "FAIL"} public content manifest${
        empty.length > 0 ? ` empty collections: ${empty.join(", ")}` : ""
      }`,
    );
    failed ||= !ok;
  } catch (error) {
    failed = true;
    console.error(`FAIL public content manifest ${error.message}`);
  }
}

process.exit(failed ? 1 : 0);
