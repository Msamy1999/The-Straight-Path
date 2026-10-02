import Link from "next/link";
import { SourceLibraryBrowser } from "@/components/content/SourceLibraryBrowser";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { getSourceLibraryCategories } from "@/lib/content";

// The deployed CMS, not the build database, determines public availability.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sources and Further Reading",
  description: "References and further reading for articles throughout The Straight Path.",
  alternates: {
    canonical: "/sources",
  },
  openGraph: {
    title: "Sources and Further Reading",
    description: "References and further reading for articles throughout The Straight Path.",
  },
};

export default async function SourcesPage() {
  const categories = await getSourceLibraryCategories();

  return (
    <>
      <Section className="border-b border-border" spacing="lg">
        <Container>
          <PageHeader
            eyebrow="Sources"
            title="Sources and further reading"
            subtitle="Each article lists its relevant primary texts and recommended further reading alongside the discussion."
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/search"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground no-underline hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Browse articles
            </Link>
            <Link
              href="/method"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground no-underline hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Read the research method
            </Link>
          </div>
        </Container>
      </Section>
      <Section spacing="lg">
        <Container>
          <SourceLibraryBrowser categories={categories} />
        </Container>
      </Section>
    </>
  );
}
