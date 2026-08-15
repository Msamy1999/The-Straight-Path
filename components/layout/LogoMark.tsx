/**
 * Inline rendering of the primary Straight Path brand mark.
 *
 * The road is deliberately clipped to the rounded frame so its perspective
 * reaches the lower edge without spilling outside the icon.
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
      viewBox="0 0 128 128"
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient
          id="brand-road-surface"
          x1="64"
          y1="38"
          x2="64"
          y2="124"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#17675F" stopOpacity="0.36" />
          <stop offset="1" stopColor="#16756B" stopOpacity="0.88" />
        </linearGradient>
        <linearGradient
          id="brand-road-edge"
          x1="64"
          y1="38"
          x2="64"
          y2="124"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFFDF8" />
          <stop offset="1" stopColor="#F1E7D8" />
        </linearGradient>
        <clipPath id="brand-frame-clip">
          <rect x="4" y="4" width="120" height="120" rx="28" />
        </clipPath>
      </defs>

      <rect x="4" y="4" width="120" height="120" rx="28" fill="#073D38" />
      <circle cx="64" cy="30" r="23" fill="#E7B94A" opacity="0.1" />
      <circle cx="64" cy="30" r="15.5" fill="#E7B94A" opacity="0.25" />
      <circle cx="64" cy="30" r="9.5" fill="#E7B94A" opacity="0.65" />
      <circle cx="64" cy="30" r="5.3" fill="#FFF9E9" />

      <g clipPath="url(#brand-frame-clip)">
        <path
          d="M18 126L60.3 37.2Q64 33.2 67.7 37.2L110 126H18Z"
          fill="url(#brand-road-surface)"
        />
        <path
          d="M18 126L60 38L62.2 35.8L31 126H18Z"
          fill="url(#brand-road-edge)"
        />
        <path
          d="M97 126L65.8 35.8L68 38L110 126H97Z"
          fill="url(#brand-road-edge)"
        />
        <path d="M63.25 47.2L63.4 41.2H64.6L64.75 47.2H63.25Z" fill="#FFFDF8" />
        <path d="M62.7 62.8L63 52.8H65L65.3 62.8H62.7Z" fill="#FFFDF8" />
        <path d="M61.8 86.8L62.2 70.8H65.8L66.2 86.8H61.8Z" fill="#FFFDF8" />
        <path d="M60.2 120.5L60.9 98H67.1L67.8 120.5H60.2Z" fill="#FFFDF8" />
      </g>
    </svg>
  );
}
