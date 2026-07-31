/**
 * Navigation config. Deliberately code-level (not CMS content): top-level
 * routes are code anyway, and this module must stay importable from client
 * components (SiteNavigation), so it contains only serializable data.
 */
import { islamChristianityCategorySlugs, siteCategories } from "@/data/site";

export const primaryNavItems = [
  { href: "/islam-overview", label: "Islam Overview" },
  { href: "/islam-christianity", label: "Islam & Christianity" },
  {
    href: "/atheism-agnosticism",
    label: "Atheism & Agnosticism",
  },
  { href: "/claims-against-islam", label: "Claims Against Islam" },
  { href: "/people-of-palestine", label: "People of Palestine" },
  { href: "/method", label: "Research Method" },
  { href: "/questions", label: "Common Questions" },
  { href: "/glossary", label: "Glossary" },
  { href: "/sources", label: "Source Library" },
];

/**
 * Hrefs of the comparison branch categories, used to keep the
 * "Islam & Christianity" nav item highlighted while browsing its branches.
 */
export const islamChristianityHrefs = islamChristianityCategorySlugs.map(
  (slug) =>
    siteCategories.find((category) => category.slug === slug)?.href ??
    `/${slug}`,
);
