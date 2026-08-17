"use client";

import { LoaderCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const MAX_LOADING_MS = 20_000;

export function NavigationLoadingIndicator() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setIsLoading(false);
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [pathname]);

  useEffect(() => {
    const startLoading = () => {
      setIsLoading(true);
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        setIsLoading(false);
        timeoutRef.current = null;
      }, MAX_LOADING_MS);
    };

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.dataset.noNavigationLoading !== undefined
      ) {
        return;
      }

      const destination = new URL(anchor.href, window.location.href);
      if (
        destination.origin !== window.location.origin ||
        destination.pathname === window.location.pathname
      ) {
        return;
      }
      startLoading();
    };

    const handlePageShow = () => setIsLoading(false);
    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", startLoading);
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", startLoading);
      window.removeEventListener("pageshow", handlePageShow);
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      className="fixed inset-0 z-[60] grid place-items-center bg-background/80 px-6 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 font-semibold text-foreground shadow-soft">
        <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin text-accent" />
        <span>Loading page…</span>
      </div>
    </div>
  );
}
