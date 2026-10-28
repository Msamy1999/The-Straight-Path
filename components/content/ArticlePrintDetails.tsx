"use client";

import { useEffect } from "react";

/** Print the full document, then restore the reader's compact panel choices. */
export function ArticlePrintDetails() {
  useEffect(() => {
    let printing = false;
    let closed: HTMLDetailsElement[] = [];
    const expand = () => {
      if (printing) return;
      printing = true;
      closed = [...document.querySelectorAll<HTMLDetailsElement>("[data-print-article] details")].filter(details => !details.open);
      closed.forEach(details => { details.open = true; });
    };
    const restore = () => {
      closed.forEach(details => { if (details.isConnected) details.open = false; });
      closed = [];
      printing = false;
    };
    window.addEventListener("beforeprint", expand);
    window.addEventListener("afterprint", restore);
    return () => {
      window.removeEventListener("beforeprint", expand);
      window.removeEventListener("afterprint", restore);
      restore();
    };
  }, []);
  return null;
}
