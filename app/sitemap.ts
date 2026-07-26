import type { MetadataRoute } from "next";
import { getArticles, getSiteCategories } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteCategories = await getSiteCategories();
  const articles = await getArticles();

  const coreRoutes = [
    "/",
    "/search",
    "/method",
    "/islam-overview",
    "/islam-christianity",
    "/atheism-agnosticism",
    "/people-of-palestine",
    "/claims-against-islam",
    "/language-demo",
    ...siteCategories.map((category) => category.href),
  ];

  const uniqueCoreRoutes = Array.from(new Set(coreRoutes));

  return [
    ...uniqueCoreRoutes.map((route) => ({
      url: absoluteUrl(route),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: route === "/" ? 1 : 0.7,
    })),
    ...articles.map((article) => ({
      url: absoluteUrl(`/articles/${article.slug}`),
      lastModified: article.lastUpdated,
      changeFrequency: "monthly" as const,
      priority: article.status === "published" ? 0.8 : 0.45,
    })),
  ];
}
