import type { Citation as CitationRecord } from "@/types/content";
import { safeExternalUrl } from "@/lib/external-url";
import { ReaderLabel } from "./ReaderLocale";

type CitationListProps = {
  citations: CitationRecord[];
  compact?: boolean;
};

export function CitationList({ citations, compact = false }: CitationListProps) {
  if (citations.length === 0) {
    return null;
  }

  return (
    <ol className={compact ? "divide-y divide-border" : "space-y-3"}>
      {citations.map((citation) => {
        const sourceUrl = safeExternalUrl(citation.url);
        return (
          <li
            key={citation.id}
            className={compact ? "py-2.5 first:pt-0 last:pb-0 text-xs leading-5 text-card-foreground" : "rounded-lg border border-border bg-card p-4 text-sm leading-7 text-card-foreground"}
          >
            <div className="flex items-start justify-between gap-3">
            <p className={compact ? "text-sm font-semibold leading-5" : "font-semibold"}>{citation.title}</p>
            {compact && sourceUrl ? <a href={sourceUrl} target="_blank" rel="noreferrer noopener" className="inline-flex min-h-8 shrink-0 items-center rounded px-2 text-xs font-medium text-accent underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><ReaderLabel en="Source" ar="المصدر" /></a> : null}
            </div>
            <p className={compact ? "mt-0.5 text-xs leading-5 text-muted-foreground" : "mt-1 text-muted-foreground"}>
              {formatCitationMeta(citation)}
            </p>
            {!compact && sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-2 inline-flex rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Source link
              </a>
            ) : null}
            {compact && citation.note ? (
              <details data-citation-details className="mt-1">
                <summary className="w-fit cursor-pointer rounded text-xs leading-6 text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"><ReaderLabel en="Details" ar="تفاصيل" /></summary>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{citation.note}</p>
              </details>
            ) : citation.note ? (
              <p className="mt-2 text-muted-foreground">{citation.note}</p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function formatCitationMeta(citation: CitationRecord) {
  const parts = [
    citation.type,
    citation.author,
    citation.publisher,
    citation.year?.toString(),
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" | ") : "Publication details unavailable";
}
