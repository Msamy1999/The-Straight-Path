import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle, Library } from "lucide-react";
import { ResearchTree } from "@/components/content/ResearchTree";
import { Container } from "@/components/layout/Container";
import { LogoMark } from "@/components/layout/LogoMark";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { getFullLibraryTree, getHomeData } from "@/lib/content";
import { siteName, siteNameArabic } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Respectful Islamic Research Library",
  description:
    "A mobile-first Islamic research library for sincere seekers and respectful comparison where needed.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteName,
    description:
      "Study Islam through clear definitions, careful sources, sincere questions, and respectful comparison where needed.",
  },
};

export default async function HomePage() {
  const [
    { christianLearningPath, comparisonMethods },
    fullLibraryTree,
  ] = await Promise.all([getHomeData(), getFullLibraryTree()]);

  return (
    <>
      <section className="border-b border-border py-5 sm:py-7">
        <Container>
          <div className="relative overflow-hidden rounded-xl border border-border bg-card px-5 py-6 shadow-soft sm:px-7 sm:py-7 lg:grid lg:grid-cols-[160px_minmax(0,1fr)] lg:items-center lg:gap-8 lg:px-9">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_130%_at_12%_50%,hsl(var(--accent)/0.13),transparent_72%)]"
            />
            <LogoMark className="pointer-events-none absolute -bottom-16 -right-10 h-52 w-52 text-accent opacity-[0.05]" />

            <div className="relative mb-5 flex items-center gap-4 lg:mb-0 lg:flex-col lg:justify-center lg:gap-2 lg:text-center">
              <LogoMark
                title={`${siteName} logo: three wandering paths merging into one straight path`}
                className="h-16 w-16 shrink-0 text-accent sm:h-20 sm:w-20 lg:h-24 lg:w-24"
              />
              <div>
                <p className="text-base font-semibold text-foreground sm:text-lg">
                  {siteName}
                </p>
                <p lang="ar" dir="rtl" className="mt-0.5 text-xs text-muted-foreground">
                  {siteNameArabic}
                </p>
              </div>
            </div>

            <div className="relative max-w-3xl">
              <p className="mb-2 inline-flex rounded-md border border-border bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                For sincere seekers
              </p>
              <h1 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl lg:text-4xl">
                Learn Islam through sincere questions and careful exploration
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                The Straight Path is a library of resources covering the foundations
                of Islam and how it compares to other systems of belief. Along with
                providing an overview of the Islamic faith, the platform offers a
                careful exploration of Christianity, atheism, agnosticism, and more,
                examining justifications for faith from both an intellectual and
                spiritual perspective.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/islam-overview">
                  Start learning
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink href="/islam-christianity" variant="secondary">
                  Islam & Christianity
                  <Library aria-hidden="true" className="h-4 w-4" />
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Section id="seekers" className="border-b border-border">
        <Container>
          <div className="max-w-4xl">
            <PageHeader
              titleAs="h2"
              eyebrow="For sincere seekers"
              title={'Goals of “The Straight Path”'}
              subtitle="The Straight Path is for visitors with real questions and a desire to understand the truth. Muslims, Christians, and curious readers should feel safe to ask questions here. The goal is not to win a fight, but to explore the answers to life’s greatest questions with sincerity, honesty, and respect."
            />
          </div>
        </Container>
      </Section>

      <Section id="library" tone="muted">
        <Container>
          <PageHeader
            titleAs="h2"
            eyebrow="Library map"
            title="Explore the complete library"
            subtitle="Every study path is gathered here. Open a branch to browse its topics, then open an article or section when you are ready."
          />
          <div className="mt-6">
            <ResearchTree
              title={siteName}
              description="Foundations, comparison, skeptical questions, Palestine studies, and research tools in one navigable map."
              nodes={fullLibraryTree}
            />
          </div>
        </Container>
      </Section>

      <Section className="border-t border-border">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div className="space-y-5">
              <PageHeader
                titleAs="h2"
                eyebrow="Recommended path for Christians"
                title="A suggested order for Christian visitors."
                subtitle="Start with Jesus, then move through Tawhid, scripture, preservation, and salvation before reading common questions."
              />
              <div className="flex flex-wrap gap-2">
                <Tag>Christians</Tag>
                <Tag>Jesus</Tag>
                <Tag>Tawhid</Tag>
                <Tag>Scripture</Tag>
              </div>
            </div>
            <ol className="grid gap-4 sm:grid-cols-2">
              {christianLearningPath.map((step, index) => (
                <li key={step.title}>
                  <Card className="h-full p-5">
                    <div className="flex items-start gap-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-semibold text-accent">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="text-base leading-snug sm:text-lg">{step.title}</h3>
                        <p className="mt-1.5 text-sm leading-6 text-muted-foreground sm:mt-2 sm:leading-7">
                          {step.description}
                        </p>
                        <Link
                          href={step.href}
                          className="mt-3 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-accent no-underline hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:mt-4"
                        >
                          Open path
                          <ArrowRight aria-hidden="true" className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </Card>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      <Section tone="muted" className="border-t border-border">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <PageHeader
              titleAs="h2"
              eyebrow="How we study"
              title="A calm method for difficult questions"
              subtitle="See clearly what is scripture, what is interpretation, what is history, what is argument, and what remains uncertain."
            />
            <div className="grid gap-3">
              {comparisonMethods.map((method) => (
                <Card key={method.title} className="p-4">
                  <div className="flex gap-3">
                    <CheckCircle
                      aria-hidden="true"
                      className="mt-1 h-5 w-5 shrink-0 text-accent"
                    />
                    <div>
                      <h3 className="text-base leading-snug">{method.title}</h3>
                      <p className="mt-1 text-sm leading-7 text-muted-foreground">
                        {method.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
              <Link
                href="/method"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground no-underline hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Read the full research method
              </Link>
            </div>
          </div>
        </Container>
      </Section>

    </>
  );
}
