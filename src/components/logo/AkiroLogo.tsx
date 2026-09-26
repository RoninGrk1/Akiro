import type { SVGProps } from "react";

export type AkiroLogoProps = SVGProps<SVGSVGElement> & {
  /** Show wordmark beside the mark */
  showWordmark?: boolean;
  size?: number;
};

/**
 * Akiro mark: a red snake coiled over a gold triangle.
 */
export function AkiroLogo({
  showWordmark = false,
  size = 32,
  className = "",
  ...props
}: AkiroLogoProps) {
  return (
    <span
      className={["inline-flex items-center gap-2.5", className].filter(Boolean).join(" ")}
      aria-label="Akiro"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-hidden={showWordmark ? true : undefined}
        {...props}
      >
        <title>Akiro</title>
        {/* Gold triangle base */}
        <path
          d="M32 8 L56 52 L8 52 Z"
          fill="#D9A441"
          stroke="#B8872E"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Inner triangle highlight */}
        <path
          d="M32 18 L48 48 L16 48 Z"
          fill="#E8BC5C"
          opacity="0.35"
        />
        {/* Red snake body — coiled S-curve over the triangle */}
        <path
          d="M22 44
             C18 38, 20 30, 28 26
             C36 22, 42 24, 44 30
             C46 36, 40 40, 34 38
             C28 36, 26 32, 30 28
             C34 24, 40 26, 42 32"
          fill="none"
          stroke="#E23B3B"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Snake underbelly highlight */}
        <path
          d="M22 44
             C18 38, 20 30, 28 26
             C36 22, 42 24, 44 30
             C46 36, 40 40, 34 38
             C28 36, 26 32, 30 28
             C34 24, 40 26, 42 32"
          fill="none"
          stroke="#FF6B6B"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.55"
        />
        {/* Snake head */}
        <ellipse cx="42.5" cy="33" rx="4.2" ry="3.4" fill="#E23B3B" />
        <ellipse cx="43.2" cy="32.4" rx="1.1" ry="1.1" fill="#1A0A0A" />
        <ellipse cx="43.5" cy="32.1" rx="0.4" ry="0.4" fill="#FFFFFF" />
        {/* Tongue */}
        <path
          d="M46.5 33.2 L49.5 32.2 M46.5 33.2 L49.2 34.6"
          stroke="#E23B3B"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Tail tip */}
        <circle cx="22" cy="44" r="2.2" fill="#C42F2F" />
      </svg>
      {showWordmark ? (
        <span className="text-base font-semibold tracking-tight text-foreground">
          Akiro
        </span>
      ) : null}
    </span>
  );
}

export default AkiroLogo;
