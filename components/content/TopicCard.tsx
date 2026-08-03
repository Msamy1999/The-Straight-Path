import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

type TopicCardProps = {
  title: string;
  description: string;
  href: string;
  icon?: LucideIcon;
  label?: string;
  meta?: string;
};

export function TopicCard({
  title,
  description,
  href,
  icon: Icon,
  label,
  meta = "Topic",
}: TopicCardProps) {
  return (
    <Card className="group flex min-h-36 flex-col transition hover:-translate-y-0.5 hover:border-accent/60 sm:min-h-44">
      <Link
        href={href}
        className="flex h-full flex-col p-4 no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:p-5"
      >
        {Icon ? (
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-muted text-accent sm:mb-4 sm:h-10 sm:w-10">
            <Icon aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        ) : null}
        {label ? (
          <p className="mb-2 text-[11px] font-semibold uppercase text-muted-foreground sm:mb-2.5 sm:text-xs">
            {label}
          </p>
        ) : null}
        <h3 className="text-base leading-snug group-hover:text-accent sm:text-lg">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:mt-3 sm:leading-7">{description}</p>
        <p className="mt-auto pt-3 text-[11px] font-medium uppercase text-muted-foreground sm:pt-4 sm:text-xs">
          {meta}
        </p>
      </Link>
    </Card>
  );
}
