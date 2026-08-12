/**
 * Inline-SVG rendering of public/logo-mark.svg (keep the two in sync).
 *
 * "Road to the light": a solid straight road in perspective, with visible
 * shoulders and lane markings, leading toward a warm gold destination light.
 * The road uses currentColor so the mark follows its parent (e.g.
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
      <path
        d="M19 22.5H45"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.2"
      />
      <circle cx="32" cy="14.5" r="9.5" fill="#C8951E" opacity="0.12" />
      <circle cx="32" cy="14.5" r="5.6" fill="#C8951E" opacity="0.28" />
      <circle cx="32" cy="14.5" r="3.6" fill="#C8951E" />
      <circle cx="32" cy="14.5" r="1.7" fill="#FFFFFF" />
      <path
        d="M10.5 58L28.5 23.2Q32 20.9 35.5 23.2L53.5 58H10.5Z"
        fill="currentColor"
      />
      <path
        d="M15.8 55.5L29.8 25.8"
        stroke="#F7F3EA"
        strokeWidth="1.7"
        strokeLinecap="round"
        opacity="0.92"
      />
      <path
        d="M48.2 55.5L34.2 25.8"
        stroke="#F7F3EA"
        strokeWidth="1.7"
        strokeLinecap="round"
        opacity="0.92"
      />
      <path
        d="M32 53V47.1"
        stroke="#F7F3EA"
        strokeWidth="3.8"
        strokeLinecap="round"
      />
      <path
        d="M32 41.7V37.4"
        stroke="#F7F3EA"
        strokeWidth="2.9"
        strokeLinecap="round"
      />
      <path
        d="M32 33.1V29.9"
        stroke="#F7F3EA"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
}
