import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { ComparisonSide } from "@/types/content";

type ComparisonBlockProps = {
  title?: ReactNode;
  intro?: ReactNode;
  left: ComparisonSide;
  right: ComparisonSide;
  footer?: ReactNode;
  className?: string;
};

export function ComparisonBlock({
  title,
  intro,
  left,
  right,
  footer,
  className,
}: ComparisonBlockProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {title || intro ? (
        <div className="max-w-3xl">
          {title ? <h3 data-read-aloud-block className="text-lg leading-snug sm:text-xl">{title}</h3> : null}
          {intro ? <p data-read-aloud-block className="mt-2 text-sm leading-6 text-muted-foreground sm:mt-3 sm:text-base sm:leading-7">{intro}</p> : null}
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <ComparisonPanel side={left} />
        <ComparisonPanel side={right} />
      </div>
      {footer ? <div data-read-aloud-block className="text-sm text-muted-foreground">{footer}</div> : null}
    </section>
  );
}

function ComparisonPanel({ side }: { side: ComparisonSide }) {
  return (
    <Card data-read-aloud-block className="p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase text-accent sm:text-sm">{side.label}</p>
      {side.title ? <h4 className="mt-2 text-base leading-snug sm:mt-3 sm:text-lg">{side.title}</h4> : null}
      <div className="mt-2 text-sm leading-6 text-muted-foreground sm:mt-3 sm:leading-7">
        {side.children}
      </div>
    </Card>
  );
}
