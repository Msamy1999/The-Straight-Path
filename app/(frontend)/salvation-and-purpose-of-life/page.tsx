import { CategoryPage } from "@/components/content/CategoryPage";
import { getCategoryBySlug } from "@/lib/content";
import { getCategoryMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return getCategoryMetadata("salvation-and-purpose-of-life");
}

export default async function SalvationAndPurposeOfLifePage() {
  return <CategoryPage category={await getCategoryBySlug("salvation-and-purpose-of-life")} />;
}
