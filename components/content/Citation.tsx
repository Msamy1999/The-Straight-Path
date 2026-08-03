import { ExternalLink } from "lucide-react";
import type { CitationSource } from "@/types/content";
import { cn } from "@/lib/utils";

type CitationProps = {
  source: CitationSource | string;
  prefix?: string;
  className?: string;
};

export function Citation({ source, prefix = "Source", className }: CitationProps) {
  const citation =
    typeof source === "string" ? { label: source, status: "pending" as const } : source;

  return (
    <p className={cn("text-xs leading-6 text-muted-foreground", className)}>
      <span className="font-medium text-foreground">{prefix}: </span>
      {citation.href ? (
        <a
          href={citation.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {citation.label}
          <ExternalLink aria-hidden="true" className="h-3 w-3" />
        </a>
      ) : (
        <span>{citation.label}</span>
      )}
      {citation.note ? <span className="ml-1">{citation.note}</span> : null}
    </p>
  );
}
