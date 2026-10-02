import { CategoryPage } from "@/components/content/CategoryPage";
import { getCategoryBySlug } from "@/lib/content";
import { getCategoryMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return getCategoryMetadata("prophecies");
}

export default async function PropheciesPage() {
  return <CategoryPage category={await getCategoryBySlug("prophecies")} />;
}
