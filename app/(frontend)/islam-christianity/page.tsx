import type { Metadata } from "next";
import { GitBranch } from "lucide-react";
import { ResearchTree } from "@/components/content/ResearchTree";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { Tag } from "@/components/ui/Tag";
import { getResearchTree } from "@/lib/content";

export const metadata: Metadata = {
  title: "Islam & Christianity",
  description:
    "A respectful branch for Christian visitors and seekers comparing Islam and Christianity through scripture, history, and reasoned argument.",
  alternates: {
    canonical: "/islam-christianity",
  },
  openGraph: {
    title: "Islam & Christianity",
    description:
      "Study Jesus, scripture, preservation, theology, salvation, and difficult questions through a respectful comparison.",
  },
};

export default async function IslamChristianityPage() {
  const islamChristianityTree = await getResearchTree("islam-christianity");

  return (
    <>
      <Section className="border-b border-border" spacing="sm">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Library", href: "/" },
              { label: "Islam & Christianity" },
            ]}
          />
          <div className="mt-5 max-w-3xl">
            <div>
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-muted text-accent sm:mb-4 sm:h-11 sm:w-11">
                <GitBranch aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <PageHeader
                eyebrow="Major section"
                title="Islam & Christianity"
                subtitle="A dedicated branch for Christian visitors and sincere seekers studying Jesus, scripture, preservation, theology, salvation, and difficult questions."
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <Tag>Jesus</Tag>
                <Tag>Scripture</Tag>
                <Tag>Theology</Tag>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container>
          <PageHeader
            titleAs="h2"
            eyebrow="Branch map"
            title="Follow the comparison tree"
            subtitle="Comparison paths are grouped by question so readers can move from broad themes into focused studies."
          />
          <div className="mt-8">
            <ResearchTree
              title="Islam & Christianity"
              description="A comparison tree for branches, studies, and related questions."
              nodes={islamChristianityTree}
            />
          </div>
        </Container>
      </Section>
    </>
  );
}
