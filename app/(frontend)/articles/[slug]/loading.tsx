import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

export default function ArticleLoading() {
  return (
    <>
      <Section className="border-b border-border" spacing="sm">
        <Container>
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-6 max-w-3xl space-y-3">
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            <div className="h-10 w-4/5 animate-pulse rounded bg-muted" />
            <div className="h-5 w-3/5 animate-pulse rounded bg-muted" />
          </div>
        </Container>
      </Section>
      <Section spacing="sm">
        <Container>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="space-y-3">
              {Array.from({ length: 7 }, (_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-lg border border-border bg-muted/50"
                />
              ))}
            </div>
            <div className="hidden h-44 animate-pulse rounded-lg border border-border bg-muted/50 lg:block" />
          </div>
        </Container>
      </Section>
    </>
  );
}
