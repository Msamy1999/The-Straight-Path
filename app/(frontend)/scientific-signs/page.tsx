import { CategoryPage } from "@/components/content/CategoryPage";
import { getCategoryBySlug } from "@/lib/content";
import { getCategoryMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return getCategoryMetadata("scientific-signs");
}

export default async function ScientificSignsPage() {
  return <CategoryPage category={await getCategoryBySlug("scientific-signs")} />;
}
