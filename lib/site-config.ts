/**
 * Pure site constants — safe to import from client components. Server-only
 * SEO helpers (which reach into the CMS) live in lib/seo.ts; importing that
 * from a client component would pull Payload into the browser bundle.
 */

export const siteName = "The Straight Path";

export const siteNameArabic = "الصراط المستقيم";

export const siteDescription =
  "A respectful Islamic research library for sincere seekers and careful comparison where needed.";

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export function absoluteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}
