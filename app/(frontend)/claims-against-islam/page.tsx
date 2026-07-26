import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { claimsAgainstIslam } from "@/data/claims-against-islam";
import { Callout } from "@/components/content/Callout";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Claims Against Islam",
  description:
    "Calm, beginner-friendly responses to common claims made against Islam, with links to deeper source-based study.",
  alternates: { canonical: "/claims-against-islam" },
};

export default function ClaimsAgainstIslamPage() {
  return (
    <>
      <Section className="border-b border-border" spacing="sm">
        <Container size="narrow">
          <Breadcrumbs
            items={[
              { label: "Library", href: "/" },
              { label: "Claims Against Islam" },
            ]}
          />
          <PageHeader
            className="mt-5"
            eyebrow="Questions and responses"
            title="Common claims against Islam"
            subtitle="Open any question to read the claim fairly, see a concise response, and continue to deeper study where it is available."
          />
          <Callout type="respectful-reminder" title="How to use this page" className="mt-6">
            These are starting answers, not slogans. Some questions involve real
            historical or moral disagreement. Read the response first, then use
            the linked studies to examine the evidence and context.
          </Callout>
        </Container>
      </Section>

      <Section tone="muted">
        <Container size="narrow">
          <div className="space-y-3">
            {claimsAgainstIslam.map((item, index) => (
              <details
                key={item.id}
                id={item.id}
                className="group scroll-mt-24 rounded-lg border border-border bg-card shadow-soft"
              >
                <summary className="flex cursor-pointer list-none items-start gap-3 px-4 py-4 text-foreground transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden sm:px-5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-accent">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-base font-semibold leading-snug sm:text-lg">
                    {item.title}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0 text-accent transition-transform group-open:rotate-180"
                  />
                </summary>
                <div className="border-t border-border px-4 py-4 sm:px-5 sm:py-5">
                  <div className="rounded-md border border-gold/30 bg-gold/10 p-3 text-sm leading-6 text-foreground sm:p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gold">
                      The claim
                    </p>
                    <p className="mt-1.5">{item.claim}</p>
                  </div>
                  <div className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                    <p className="font-semibold text-foreground">A careful response</p>
                    {item.response.map((paragraph) => (
                      <p key={paragraph} className="mt-2.5">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {item.links?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="inline-flex min-h-10 items-center rounded-md border border-border bg-background px-3 text-sm font-semibold text-accent no-underline hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                        >
                          Read: {link.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
