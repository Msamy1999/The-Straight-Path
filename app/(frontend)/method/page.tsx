import type { Metadata } from "next";
import {
  BookMarked,
  ClipboardCheck,
  History,
  MessageCircleHeart,
  PencilLine,
} from "lucide-react";
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
    "How The Straight Path distinguishes scripture, interpretation, history, and argument.",
  alternates: {
    canonical: "/method",
  },
  openGraph: {
    title: "Research Method",
    description:
      "A transparent method for respectful comparison and careful reasoning.",
  },
};

const methodSteps = [
  {
    title: "Scripture first",
    description:
      "Read scripture with its passage, reference, and translation or version before drawing conclusions from it.",
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
      "Academic, commentary, manuscript, tafsir, hadith, and translation sources help readers evaluate a claim in context.",
    icon: ClipboardCheck,
  },
  {
    title: "Respectful comparison",
    description:
      "Christian and Islamic views should be described fairly, with scripture, interpretation, history, and argument kept separate.",
    icon: MessageCircleHeart,
  },
  {
    title: "Intellectual humility",
    description:
      "Strong conclusions should remain open to clearer evidence, better context, and fair objections.",
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
            <Callout type="respectful-reminder" title="Read with care">
              This material distinguishes scripture, interpretation, history,
              and argument so that each claim can be considered on its own terms.
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
            subtitle="These principles help readers follow a claim from its sources to its conclusion."
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

      <Section tone="muted" className="border-t border-border">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-2xl leading-snug">Check sources as you read</h2>
              <p className="mt-3 max-w-3xl text-muted-foreground">
                Sources, glossary entries, and related discussions make it easier
                to examine claims rather than accept them without evidence.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <ButtonLink href="/sources">Open Source Library</ButtonLink>
              <ButtonLink href="/search" variant="secondary">
                Search Articles
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
