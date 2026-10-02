import { CategoryPage } from "@/components/content/CategoryPage";
import { getCategoryBySlug } from "@/lib/content";
import { getCategoryMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return getCategoryMetadata("war-and-violence");
}

export default async function WarAndViolencePage() {
  return <CategoryPage category={await getCategoryBySlug("war-and-violence")} />;
}
