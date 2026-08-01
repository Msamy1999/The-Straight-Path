import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  BookMarked,
  ClipboardCheck,
  History,
  MessageCircleHeart,
  PencilLine,
} from "lucide-react";
import { ArticleStatusBadge } from "@/components/content/ArticleStatusBadge";
import { Callout } from "@/components/content/Callout";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Research Method",
  description:
    "How The Straight Path separates scripture, interpretation, history, argument, citations, and draft status.",
  alternates: {
    canonical: "/method",
  },
  openGraph: {
    title: "Research Method",
    description:
      "A transparent method for respectful comparison, source status, and educational draft content.",
  },
};

const methodSteps = [
  {
    title: "Scripture first",
    description:
      "When scripture is quoted, the page should show the passage, reference, translation or version, and source status before interpretation.",
    icon: BookMarked,
  },
  {
    title: "Historical context",
    description:
      "Historical claims should identify what is known, what is debated, and which sources support the discussion.",
    icon: History,
  },
  {
    title: "Scholarly sources",
    description:
      "Academic, commentary, manuscript, tafsir, hadith, and translation sources should be clearly attributed before publication.",
    icon: ClipboardCheck,
  },
  {
    title: "Respectful comparison",
    description:
      "Christian and Islamic views should be described fairly, with scripture, interpretation, history, and argument kept separate.",
    icon: MessageCircleHeart,
  },
  {
    title: "Corrections welcome",
    description:
      "Draft material should be easy to improve when evidence needs correction, a claim needs nuance, or a citation is missing.",
    icon: PencilLine,
  },
];

export default function MethodPage() {
  return (
    <>
      <Section className="border-b border-border" spacing="lg">
        <Container>
          <Breadcrumbs
            items={[{ label: "Library", href: "/" }, { label: "Research Method" }]}
          />
          <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <PageHeader
              eyebrow="Research Method"
              title="A careful way to study difficult questions"
              subtitle="Separate scripture, interpretation, historical context, and argument so each claim can be weighed on its own terms."
            />
            <Callout type="respectful-reminder" title="Educational disclaimer">
              This material is for study and comparison. Check important claims
              against the cited evidence, and remember that draft material is not
              final until they have been reviewed.
            </Callout>
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container>
          <PageHeader
            titleAs="h2"
            eyebrow="Method"
            title="A clear path for careful study"
            subtitle="These standards guide future article writing, editing, and review."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {methodSteps.map((step) => {
              const Icon = step.icon;

              return (
                <Card key={step.title} className="p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-muted text-accent">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 text-xl leading-snug">{step.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {step.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section className="border-t border-border">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <PageHeader
              titleAs="h2"
              eyebrow="Status labels"
              title="Draft state stays visible"
              subtitle="Article status labels help readers know whether a page is a framework, under review, or ready for regular reading."
            />
            <div className="grid gap-4">
              <StatusExplanation
                status={<ArticleStatusBadge status="draft" />}
                description="Draft material may contain placeholders, pending evidence, and unfinished study notes."
              />
              <StatusExplanation
                status={<ArticleStatusBadge status="reviewed" />}
                description="An under-review page is being checked for citations, wording, and fair representation."
              />
              <StatusExplanation
                status={<ArticleStatusBadge status="published" />}
                description="A published page should still invite readers to verify claims against its cited sources."
              />
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="muted" className="border-t border-border">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-2xl leading-snug">Check sources as you read</h2>
              <p className="mt-3 max-w-3xl text-muted-foreground">
                Source cards, glossary entries, and draft discussions make it
                easier to verify claims rather than accept them without evidence.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <ButtonLink href="/sources">Open Source Library</ButtonLink>
              <ButtonLink href="/search" variant="secondary">
                Search Draft Articles
              </ButtonLink>
            </div>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Future correction details can be linked here when a public review
            workflow is added.
          </p>
        </Container>
      </Section>
    </>
  );
}

function StatusExplanation({
  status,
  description,
}: {
  status: ReactNode;
  description: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {status}
        <Link
          href="/sources"
          className="text-sm font-semibold text-accent no-underline hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Review source standards
        </Link>
      </div>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">{description}</p>
    </Card>
  );
}
