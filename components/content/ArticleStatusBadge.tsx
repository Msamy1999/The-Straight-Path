import { cn } from "@/lib/utils";
import type { ArticleStatus } from "@/types/content";

type ArticleStatusBadgeProps = {
  status: ArticleStatus;
  className?: string;
};

const statusStyles: Record<ArticleStatus, string> = {
  draft: "border-gold/50 bg-gold/10 text-foreground",
  reviewed: "border-secondary/45 bg-secondary/10 text-foreground",
  published: "border-accent/45 bg-accent/10 text-foreground",
};

const statusLabels: Record<ArticleStatus, string> = {
  draft: "Draft",
  reviewed: "Under review",
  published: "Published",
};

const statusDescriptions: Record<ArticleStatus, string> = {
  draft:
    "An article whose scripture references, citations, and claims are still being checked.",
  reviewed:
    "Under review; sources and wording should still be checked before final publication.",
  published:
    "Published with cited sources available for readers who want to verify the claims.",
};

export function getArticleStatusLabel(status: ArticleStatus) {
  return statusLabels[status];
}

export function getArticleStatusDescription(status: ArticleStatus) {
  return statusDescriptions[status];
}

export function ArticleStatusBadge({
  status,
  className,
}: ArticleStatusBadgeProps) {
  const label = getArticleStatusLabel(status);

  return (
    <span
      aria-label={`Article status: ${label}`}
      className={cn(
        "inline-flex min-h-7 items-center rounded-md border px-2.5 py-1 text-xs font-semibold",
        statusStyles[status],
        className,
      )}
    >
      {label}
    </span>
  );
}
