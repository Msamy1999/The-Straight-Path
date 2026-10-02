import { CategoryPage } from "@/components/content/CategoryPage";
import { getCategoryBySlug } from "@/lib/content";
import { getCategoryMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return getCategoryMetadata("jesus-in-islam-and-christianity");
}

export default async function JesusInIslamAndChristianityPage() {
  return <CategoryPage category={await getCategoryBySlug("jesus-in-islam-and-christianity")} />;
}
