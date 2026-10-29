import type { Metadata } from "next";
import Link from "next/link";
import { GitBranch } from "lucide-react";
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
  title: "Islam & Christianity",
  description:
    "Explore the Islamic case for God, Jesus, revelation, and salvation through evidence, fair objections, and clear next steps.",
  alternates: {
    canonical: "/islam-christianity",
  },
  openGraph: {
    title: "Islam & Christianity",
    description:
      "A reasoned invitation to Islam that examines Jesus, scripture, salvation, and serious Christian objections fairly.",
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
                subtitle="Explore why Muslims believe Islam is true: its account of God, Jesus, revelation, and salvation, with evidence and serious objections examined fairly."
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
            title="Follow the evidence"
            subtitle="Start with the main questions, then follow each argument into its evidence, strongest objections, and practical meaning."
          />
          <div className="mt-5 flex flex-wrap gap-3" aria-label="Foundations of the Islamic case">
            <Link href="/articles/why-the-quran" className="inline-flex min-h-11 items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              Why trust the Quran?
            </Link>
            <Link href="/articles/who-is-prophet-muhammad" className="inline-flex min-h-11 items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              Examine Muhammad's prophetic claim
            </Link>
          </div>
          <div className="mt-8">
            <ResearchTree
              title="Islam & Christianity"
              description="A connected study of Islam's case, its evidence, and the questions a sincere seeker needs answered."
              nodes={islamChristianityTree}
            />
          </div>
        </Container>
      </Section>
    </>
  );
}
