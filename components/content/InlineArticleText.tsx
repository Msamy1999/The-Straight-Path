import Link from "next/link";
import type { ReactNode } from "react";
import { safeExternalUrl } from "@/lib/external-url";
import { ScriptureReferenceText } from "./ScriptureReferenceText";

/** Authored study links stay on this site; source links remain HTTPS-only. */
export function articleTextLink(value: string): { href: string; internal: boolean } | undefined {
  if (/^\/articles\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    return { href: value, internal: true };
  }
  const href = safeExternalUrl(value);
  return href ? { href, internal: false } : undefined;
}

export function renderInlineMarkdown(text: string, keyPrefix: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|__[\s\S]+?__|\[[^\]]+\]\((?:https?:\/\/[^\s)]+|\/articles\/[^\s)]+)\))/g);
  return parts.map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/articles\/[^\s)]+)\)$/);
    if (link) {
      const target = articleTextLink(link[2]);
      const label = <ScriptureReferenceText text={link[1]} />;
      if (!target) return <span key={`${keyPrefix}-${index}`}>{label}</span>;
      const className = "font-medium text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
      return target.internal ? (
        <Link key={`${keyPrefix}-${index}`} href={target.href} className={className}>{label}</Link>
      ) : (
        <a key={`${keyPrefix}-${index}`} href={target.href} target="_blank" rel="noreferrer noopener" className={className}>{label}</a>
      );
    }
    const bold = part.match(/^\*\*([\s\S]+)\*\*$|^__([\s\S]+)__$/);
    return bold ? (
      <strong key={`${keyPrefix}-${index}`} className="font-semibold text-foreground"><ScriptureReferenceText text={bold[1] ?? bold[2]} /></strong>
    ) : <span key={`${keyPrefix}-${index}`}><ScriptureReferenceText text={part} /></span>;
  });
}
