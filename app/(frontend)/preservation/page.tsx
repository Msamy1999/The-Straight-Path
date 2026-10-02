import { CategoryPage } from "@/components/content/CategoryPage";
import { getCategoryBySlug } from "@/lib/content";
import { getCategoryMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return getCategoryMetadata("preservation");
}

export default async function PreservationPage() {
  return <CategoryPage category={await getCategoryBySlug("preservation")} />;
}
