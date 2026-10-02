import { CategoryPage } from "@/components/content/CategoryPage";
import { getCategoryBySlug } from "@/lib/content";
import { getCategoryMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return getCategoryMetadata("historical-evidence");
}

export default async function HistoricalEvidencePage() {
  return <CategoryPage category={await getCategoryBySlug("historical-evidence")} />;
}
