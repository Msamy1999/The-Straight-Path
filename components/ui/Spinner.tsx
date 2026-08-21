import { cn } from "@/lib/utils";

/**
 * A brand-coloured progress ring rather than a generic spinner glyph, so every
 * loading surface — buttons, overlays, the translation card — reads as one
 * piece of design. Static for readers who ask for reduced motion.
 */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={cn("motion-safe:animate-spin", className)}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
