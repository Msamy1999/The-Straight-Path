import { ChevronDown, BookOpen } from "lucide-react";
import type { ReactNode } from "react";
import { ReaderLabel } from "./ReaderLocale";

export function CompactArticleDetails({ id, title, arabicTitle, count, children, className = "" }: {
  id?: string; title: string; arabicTitle: string; count: number; children: ReactNode; className?: string;
}) {
  return (
    <details id={id} data-compact-article-details className={`group/compact scroll-mt-20 rounded-lg border border-border bg-card ${className}`}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2.5 rounded-lg px-3 py-2 text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-3.5 [&::-webkit-details-marker]:hidden">
        <BookOpen aria-hidden="true" className="h-4 w-4 shrink-0 text-accent" />
        <span className="min-w-0 text-sm font-semibold text-foreground"><ReaderLabel en={title} ar={arabicTitle} /></span>
        <span className="rounded-full bg-muted px-2 text-[0.7rem] tabular-nums text-muted-foreground">{count}</span>
        <ChevronDown aria-hidden="true" className="ms-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open/compact:rotate-180" />
      </summary>
      <div className="border-t border-border p-2.5 sm:p-3">{children}</div>
    </details>
  );
}
