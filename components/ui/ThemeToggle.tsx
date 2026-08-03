"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Light/dark toggle.
 *
 * The site opens in light mode by default. Once a reader clicks the toggle we
 * store an explicit "light" | "dark" choice and add a matching class to
 * <html>. The matching no-flash script lives in app/layout.tsx.
 */
export function ThemeToggle({ className }: { className?: string }) {
  // `null` until mounted so the server and first client render match (the icon
  // depends on runtime state we can't know during SSR).
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const dark = root.classList.contains("dark");
    if (!dark && !root.classList.contains("light")) {
      root.classList.add("light");
    }
    setIsDark(dark);
  }, []);

  function toggle() {
    const next = !isDark;
    const root = document.documentElement;
    root.classList.toggle("dark", next);
    root.classList.toggle("light", !next);
    try {
      window.localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Ignore storage failures (private mode, etc.) — the class still applies.
    }
    setIsDark(next);
  }

  const label =
    isDark === null
      ? "Toggle color theme"
      : isDark
        ? "Switch to light mode"
        : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-md border border-border bg-card text-foreground transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      )}
    >
      {/* Reserve the icon box until mounted to avoid a hydration mismatch. */}
      {isDark === null ? (
        <span className="h-5 w-5" aria-hidden="true" />
      ) : isDark ? (
        <Sun aria-hidden="true" className="h-5 w-5" />
      ) : (
        <Moon aria-hidden="true" className="h-5 w-5" />
      )}
    </button>
  );
}
