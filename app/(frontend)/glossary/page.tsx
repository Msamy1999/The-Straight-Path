import { GlossaryBrowser } from "@/components/content/GlossaryBrowser";
import { Callout } from "@/components/content/Callout";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { getGlossaryTerms } from "@/lib/content";

export const metadata = {
  title: "Glossary",
  description:
    "Draft glossary terms for theology, scripture, history, preservation, and source-library study.",
  alternates: {
    canonical: "/glossary",
  },
  openGraph: {
    title: "Glossary",
    description:
      "Draft glossary terms for theology, scripture, history, preservation, and source-library study.",
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
            subtitle="Search glossary entries for theology, scripture, and history. Definitions remain pending verification until reviewed."
          />
          <div className="mt-6">
            <Callout type="note" title="Draft glossary standard">
              These terms are study aids, not final academic definitions. Future
              versions should cite reliable sources for each definition.
            </Callout>
          </div>
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
