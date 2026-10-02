import { CategoryPage } from "@/components/content/CategoryPage";
import { getCategoryBySlug } from "@/lib/content";
import { getCategoryMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return getCategoryMetadata("the-quran-and-the-bible");
}

export default async function TheQuranAndTheBiblePage() {
  return <CategoryPage category={await getCategoryBySlug("the-quran-and-the-bible")} />;
}
