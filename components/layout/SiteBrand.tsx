import Link from "next/link";
import { LogoMark } from "@/components/layout/LogoMark";
import { siteName, siteNameArabic } from "@/lib/site-config";
import { cn } from "@/lib/utils";

type SiteBrandProps = {
  as?: "link" | "text";
  className?: string;
  onClick?: () => void;
  compact?: boolean;
};

export function SiteBrand({
  as = "link",
  className,
  onClick,
  compact = false,
}: SiteBrandProps) {
  const content = (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <LogoMark
        className={cn(
          "shrink-0 text-accent",
          compact ? "h-6 w-6" : "h-8 w-8",
        )}
      />
      <span className="flex min-w-0 flex-col leading-tight">
        <span
          lang="en"
          dir="ltr"
          translate="no"
          className={cn(
            "notranslate font-semibold text-foreground",
            compact ? "text-sm" : "text-base",
          )}
        >
          {siteName}
        </span>
        {!compact ? (
          <span lang="ar" dir="rtl" translate="no" className="notranslate text-right text-xs text-muted-foreground">
            {siteNameArabic}
          </span>
        ) : null}
      </span>
    </span>
  );

  if (as === "text") {
    return content;
  }

  return (
    <Link
      href="/"
      aria-label={`${siteName} home`}
      onClick={onClick}
      className="shrink-0 no-underline"
    >
      {content}
    </Link>
  );
}
