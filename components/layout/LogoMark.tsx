/**
 * Inline-SVG rendering of public/logo-mark.svg (keep the two in sync).
 *
 * "Road to the light": a straight road in perspective, open at the horizon,
 * receding toward a white light with a warm gold glow. Road strokes use
 * currentColor so the mark follows the text color of its parent (e.g.
 * `text-accent`) in light and dark mode; size it with Tailwind classes such
 * as `h-8 w-8`.
 */
type LogoMarkProps = {
  className?: string;
  /** Accessible name. When omitted the mark is decorative (aria-hidden). */
  title?: string;
};

export function LogoMark({ className, title }: LogoMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {/* The white light at the end of the road, with a warm glow */}
      <circle cx="32" cy="15.5" r="11" fill="#C8951E" opacity="0.18" />
      <circle cx="32" cy="15.5" r="7" fill="#C8951E" opacity="0.4" />
      <circle cx="32" cy="15.5" r="4.2" fill="#FFFFFF" stroke="#C8951E" strokeWidth="1.6" />
      {/* The straight road, in perspective, open at the horizon */}
      <path d="M15 58 L26.8 27" stroke="currentColor" strokeWidth="4.6" strokeLinecap="round" />
      <path d="M49 58 L37.2 27" stroke="currentColor" strokeWidth="4.6" strokeLinecap="round" />
      {/* Center line receding toward the light */}
      <path
        d="M32 55.5 L32 49.5"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M32 44 L32 39"
        stroke="currentColor"
        strokeWidth="2.7"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M32 34 L32 30.5"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
