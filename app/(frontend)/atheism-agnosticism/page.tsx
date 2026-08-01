import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CircleHelp } from "lucide-react";
import { Callout } from "@/components/content/Callout";
import { ResearchTree } from "@/components/content/ResearchTree";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { Tag } from "@/components/ui/Tag";
import { getResearchTree } from "@/lib/content";

export const metadata: Metadata = {
  title: "Atheism & Agnosticism Answers in Islam",
  description:
    "Clear answers for atheists, agnostics, skeptics, and seekers studying Islam.",
  alternates: {
    canonical: "/atheism-agnosticism",
  },
  openGraph: {
    title: "Atheism & Agnosticism Answers in Islam",
    description:
      "Carefully sourced articles about belief, doubt, meaning, evidence, morality, science, and the Quran.",
  },
};

export default async function AtheismAgnosticismPage() {
  const atheismAgnosticismTree = await getResearchTree("atheism-agnosticism");

  return (
    <>
      <Section className="border-b border-border" spacing="sm">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Library", href: "/" },
              { label: "Atheism & Agnosticism Answers in Islam" },
            ]}
          />
          <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-muted text-accent sm:mb-4 sm:h-11 sm:w-11">
                <CircleHelp aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <PageHeader
                eyebrow="Audience path"
                title="Atheism & Agnosticism Answers in Islam"
                subtitle="A respectful section for skeptics, agnostics, atheists, and seekers, built from clear definitions, careful reasoning, and evidence."
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <Tag>Doubt</Tag>
                <Tag>Meaning</Tag>
                <Tag>Evidence</Tag>
                <Tag>Draft</Tag>
              </div>
            </div>
            <Callout type="note" title="Draft status">
              All nine foundational articles are written, source-checked, and
              available to read as drafts. A human editor must advance them
              through the review and publishing workflow.
            </Callout>
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container>
          <PageHeader
            titleAs="h2"
            eyebrow="Question map"
            title="Foundational questions and answers"
            subtitle="Open any topic below to read the completed article and follow the sequence from God's existence to the Quran's claim to revelation."
          />
          <div className="mt-6">
            <ResearchTree
              title="Atheism & Agnosticism"
              description="Nine carefully ordered discussions for skeptical and honest questions."
              nodes={atheismAgnosticismTree}
            />
          </div>
          <Link
            href="/questions"
            className="mt-6 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-accent no-underline hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Continue to common questions
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </Container>
      </Section>
    </>
  );
}
