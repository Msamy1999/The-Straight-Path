import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReaderFaqMarker } from "./ReaderLocale";

type FAQItemProps = {
  question: ReactNode;
  answer: ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

export function FAQItem({
  question,
  answer,
  defaultOpen = false,
  className,
}: FAQItemProps) {
  return (
    <details
      open={defaultOpen}
      className={cn("group border-b border-border py-4", className)}
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 rounded-md text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
        <ReaderFaqMarker question />
        <span className="min-w-0 flex-1 select-text font-semibold text-foreground">{question}</span>
        <ChevronDown
          aria-hidden="true"
          className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition group-open:rotate-180"
        />
      </summary>
      <div className="mt-3 flex items-start gap-3 select-text text-sm leading-7 text-muted-foreground"><ReaderFaqMarker question={false} /><div className="min-w-0">{answer}</div></div>
    </details>
  );
}
