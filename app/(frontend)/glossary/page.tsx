import { GlossaryBrowser } from "@/components/content/GlossaryBrowser";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { getGlossaryTerms } from "@/lib/content";

export const metadata = {
  title: "Glossary",
  description:
    "Definitions for theology, scripture, history, and preservation.",
  alternates: {
    canonical: "/glossary",
  },
  openGraph: {
    title: "Glossary",
    description:
      "Definitions for theology, scripture, history, and preservation.",
  },
};

export default async function GlossaryPage() {
  const terms = await getGlossaryTerms();

  return (
    <>
      <Section className="border-b border-border" spacing="lg">
        <Container>
          <PageHeader
            eyebrow="Glossary"
            title="Study terms and definitions"
            subtitle="Search glossary entries for theology, scripture, history, and preservation."
          />
        </Container>
      </Section>
      <Section tone="muted">
        <Container>
          <GlossaryBrowser terms={terms} />
        </Container>
      </Section>
    </>
  );
}
