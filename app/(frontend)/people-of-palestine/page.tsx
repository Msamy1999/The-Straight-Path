import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, HandHeart } from "lucide-react";
import { ResearchTree } from "@/components/content/ResearchTree";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { Tag } from "@/components/ui/Tag";
import { getResearchTree } from "@/lib/content";

// The deployed CMS, not the build database, determines public availability.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "People of Palestine",
  description:
    "A beginner-friendly path through Palestinian people, places, history, Al-Aqsa, justice, and responsible action from an Islamic perspective.",
  alternates: {
    canonical: "/people-of-palestine",
  },
  openGraph: {
    title: "People of Palestine",
    description:
      "A beginner-friendly path through Palestinian people, places, history, Al-Aqsa, justice, and responsible action from an Islamic perspective.",
  },
};

export default async function PeopleOfPalestinePage() {
  const peopleOfPalestineTree = await getResearchTree("people-of-palestine");

  return (
    <>
      <Section className="border-b border-border" spacing="sm">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Library", href: "/" },
              { label: "People of Palestine" },
            ]}
          />
          <div className="mt-5">
            <div>
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-muted text-accent sm:mb-4 sm:h-11 sm:w-11">
                <HandHeart aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <PageHeader
                eyebrow="People, history, faith, and justice"
                title="People of Palestine"
                subtitle="Begin with people and place, learn the main history, understand Al-Aqsa's place in Islam, and turn concern into truthful, compassionate action."
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <Tag>Human dignity</Tag>
                <Tag>History</Tag>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container>
          <PageHeader
            titleAs="h2"
            eyebrow="Study map"
            title="A clear path from understanding to action"
            subtitle="Start with the foundations, then follow the history, faith, justice, and source guides at your own pace."
          />
          <div className="mt-6">
            <ResearchTree
              title="People of Palestine"
              description="A concise reading path arranged for beginners, with direct links to scripture and authoritative sources."
              nodes={peopleOfPalestineTree}
            />
          </div>
          <Link
            href="/method"
            className="mt-6 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-accent no-underline hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Explore the research method
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </Container>
      </Section>
    </>
  );
}
