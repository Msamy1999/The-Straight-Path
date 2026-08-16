"use client";

import { Check, Copy, Volume2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type ArticlePlaybackRegistration,
  type SpeechChunk,
  useArticleAudio,
} from "@/components/audio/ArticleAudioProvider";
import { cn } from "@/lib/utils";
import type { ArticlePlaybackNavigation } from "@/types/domain";

type ArticleToolsProps = ArticlePlaybackNavigation & {
  articleSlug: string;
  articleTitle: string;
  articleSubtitle?: string;
  className?: string;
};

type CopyStatus = { kind: "success" | "error"; message: string } | null;

const MAX_CHUNK_LENGTH = 360;
const COPY_STATUS_MS = 2_500;

const toolButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const primaryToolClass = "bg-accent text-accent-foreground hover:brightness-110";
const secondaryToolClass =
  "border border-border bg-card text-foreground hover:bg-muted";

function toSpeechText(text: string): string {
  return text
    .replace(/[*_#`]+/g, "")
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/\s*\n+\s*/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  const pushLongSentence = (sentence: string) => {
    let piece = "";
    for (const word of sentence.split(/\s+/)) {
      const candidate = piece ? `${piece} ${word}` : word;
      if (candidate.length > MAX_CHUNK_LENGTH && piece) {
        chunks.push(piece);
        piece = word;
      } else {
        piece = candidate;
      }
    }
    if (piece) chunks.push(piece);
  };

  for (const paragraph of text.split(/\n+/)) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;
    const sentences =
      trimmed.match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) ?? [trimmed];
    let current = "";
    for (const raw of sentences) {
      const sentence = raw.trim();
      if (!sentence) continue;
      if (sentence.length > MAX_CHUNK_LENGTH) {
        if (current) chunks.push(current);
        current = "";
        pushLongSentence(sentence);
        continue;
      }
      const candidate = current ? `${current} ${sentence}` : sentence;
      if (candidate.length > MAX_CHUNK_LENGTH && current) {
        chunks.push(current);
        current = sentence;
      } else {
        current = candidate;
      }
    }
    if (current) chunks.push(current);
  }

  return chunks.map((chunk) => chunk.trim()).filter(Boolean);
}

function getElementText(element: HTMLElement, includeArabic: boolean): string {
  const clone = element.cloneNode(true) as HTMLElement;
  clone
    .querySelectorAll("[data-read-aloud-exclude]")
    .forEach((child) => child.remove());
  if (!includeArabic) {
    clone.querySelectorAll('[lang="ar"]').forEach((child) => child.remove());
  }
  return (clone.textContent ?? "").trim();
}

function getRenderedArticleText(
  articleTitle: string,
  articleSubtitle?: string,
): string {
  const content = document.querySelector<HTMLElement>(
    "[data-article-readable-content]",
  );
  let renderedText = "";
  if (content) {
    const clone = content.cloneNode(true) as HTMLElement;
    clone
      .querySelectorAll("[data-read-aloud-exclude]")
      .forEach((element) => element.remove());
    clone.querySelectorAll("details").forEach((details) => {
      details.open = true;
    });
    clone.setAttribute("aria-hidden", "true");
    Object.assign(clone.style, {
      position: "fixed",
      left: "-10000px",
      top: "0",
      width: "48rem",
      opacity: "0",
      pointerEvents: "none",
    });
    document.body.appendChild(clone);
    try {
      renderedText = clone.innerText;
    } finally {
      clone.remove();
    }
  }
  return [articleTitle, articleSubtitle, renderedText]
    .filter((value): value is string => Boolean(value?.trim()))
    .join("\n\n")
    .trim();
}

function collectSpeechChunks(
  articleTitle: string,
  articleSubtitle?: string,
): SpeechChunk[] {
  const content = document.querySelector<HTMLElement>(
    "[data-article-readable-content]",
  );
  const titleOwner = document.querySelector<HTMLElement>("main h1");
  const subtitleOwner =
    titleOwner?.nextElementSibling instanceof HTMLElement
      ? titleOwner.nextElementSibling
      : titleOwner;
  const blocks: Array<{ text: string; owner: HTMLElement | null }> = [
    { text: articleTitle, owner: titleOwner },
    ...(articleSubtitle
      ? [{ text: articleSubtitle, owner: subtitleOwner ?? titleOwner }]
      : []),
  ];

  if (content) {
    const candidates = Array.from(
      content.querySelectorAll<HTMLElement>(
        "[data-read-aloud-block], [data-read-aloud-container] > span, [data-read-aloud-container] > h3",
      ),
    );
    for (const owner of candidates) {
      if (owner.closest("[data-read-aloud-exclude]")) continue;
      const parentBlock = owner.parentElement?.closest("[data-read-aloud-block]");
      if (parentBlock && content.contains(parentBlock)) continue;
      const text = toSpeechText(getElementText(owner, false));
      if (text) blocks.push({ text, owner });
    }
  }

  return blocks.flatMap(({ text, owner }) =>
    chunkText(text).map((chunk) => ({ text: chunk, owner })),
  );
}

function fallbackCopy(articleText: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = articleText;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  let succeeded = false;
  try {
    succeeded = document.execCommand("copy");
  } finally {
    textarea.remove();
  }
  return succeeded;
}

export function ArticleTools({
  articleSlug,
  articleTitle,
  articleSubtitle,
  previous,
  next,
  className,
}: ArticleToolsProps) {
  const { registerArticle, startArticle, activeSlug, playState } =
    useArticleAudio();
  const [copyStatus, setCopyStatus] = useState<CopyStatus>(null);
  const copyTimeoutRef = useRef<number | null>(null);

  const getChunks = useCallback(
    () => collectSpeechChunks(articleTitle, articleSubtitle),
    [articleSubtitle, articleTitle],
  );
  const registration = useMemo<ArticlePlaybackRegistration>(
    () => ({
      slug: articleSlug,
      title: articleTitle,
      subtitle: articleSubtitle,
      href: `/articles/${articleSlug}`,
      previous,
      next,
      getChunks,
    }),
    [articleSlug, articleSubtitle, articleTitle, getChunks, next, previous],
  );

  useEffect(() => registerArticle(registration), [registerArticle, registration]);
  useEffect(
    () => () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    },
    [],
  );

  const showCopyStatus = (status: NonNullable<CopyStatus>) => {
    if (copyTimeoutRef.current !== null) {
      window.clearTimeout(copyTimeoutRef.current);
    }
    setCopyStatus(status);
    copyTimeoutRef.current = window.setTimeout(() => {
      setCopyStatus(null);
      copyTimeoutRef.current = null;
    }, COPY_STATUS_MS);
  };

  const handleCopy = async () => {
    const articleText = getRenderedArticleText(articleTitle, articleSubtitle);
    let succeeded = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(articleText);
        succeeded = true;
      }
    } catch {
      succeeded = false;
    }
    if (!succeeded) {
      try {
        succeeded = fallbackCopy(articleText);
      } catch {
        succeeded = false;
      }
    }
    showCopyStatus(
      succeeded
        ? { kind: "success", message: "Article copied successfully." }
        : { kind: "error", message: "Copy failed" },
    );
  };

  const isCurrent = activeSlug === articleSlug && playState !== "idle";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <button
        type="button"
        onClick={() => startArticle(registration)}
        aria-label={`Read article aloud: ${articleTitle}`}
        className={cn(toolButtonClass, primaryToolClass)}
      >
        <Volume2 aria-hidden="true" className="h-4 w-4" />
        {isCurrent ? "Restart article" : "Read article"}
      </button>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy article: ${articleTitle}`}
        className={cn(toolButtonClass, secondaryToolClass)}
      >
        {copyStatus?.kind === "success" ? (
          <Check aria-hidden="true" className="h-4 w-4 text-accent" />
        ) : (
          <Copy aria-hidden="true" className="h-4 w-4" />
        )}
        Copy article
      </button>
      <p
        aria-live="polite"
        className={cn(
          "text-sm font-medium",
          copyStatus?.kind === "error" ? "text-gold" : "text-accent",
          copyStatus ? "" : "sr-only",
        )}
      >
        {copyStatus?.message ?? ""}
      </p>
    </div>
  );
}
