import { CategoryPage } from "@/components/content/CategoryPage";
import { getCategoryBySlug } from "@/lib/content";
import { getCategoryMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return getCategoryMetadata("religious-history");
}

export default async function ReligiousHistoryPage() {
  return <CategoryPage category={await getCategoryBySlug("religious-history")} />;
}
