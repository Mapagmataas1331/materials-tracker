import type { SVGProps } from "react";

import { cn } from "@/lib/utils";
import {
  EXO_LOCKUP,
  EXO_LOCKUP_RU,
  EXO_SYMBOL,
  EXO_WORDMARK,
  EXO_WORDMARK_RU,
  type BrandArtwork,
} from "@/components/icons/exomaterial-artwork";

type LogoProps = SVGProps<SVGSVGElement> & {
  /** Accessible name. When omitted the artwork is decorative (aria-hidden). */
  title?: string;
};

function BrandSvg({
  artwork,
  className,
  title,
  style,
  ...props
}: LogoProps & { artwork: BrandArtwork }) {
  const decorative = !title;
  return (
    <svg
      viewBox={`0 0 ${artwork.width} ${artwork.height}`}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      focusable="false"
      className={cn("shrink-0", className)}
      style={{ aspectRatio: `${artwork.width} / ${artwork.height}`, ...style }}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path d={artwork.paths.join("")} />
    </svg>
  );
}

/**
 * Official Exomaterial symbol (the «X» mark, brand guide p.13).
 * Wide mark (≈2.12:1). Size it by width (`w-*`); height follows the aspect ratio.
 * Uses `currentColor` — set colour via `text-*`. Brand guide minimum: 24px wide.
 */
export function LogoIcon({ className, ...props }: LogoProps) {
  return <BrandSvg artwork={EXO_SYMBOL} className={cn("h-auto w-6", className)} {...props} />;
}

/** EXOMATERIAL / ЭКЗОМАТЕРИАЛ wordmark exactly as drawn in the brand guide (p.16). */
export function LogoWordmark({
  className,
  script = "latin",
  ...props
}: LogoProps & { script?: "latin" | "cyrillic" }) {
  return (
    <BrandSvg
      artwork={script === "cyrillic" ? EXO_WORDMARK_RU : EXO_WORDMARK}
      className={cn("h-4 w-auto", className)}
      {...props}
    />
  );
}

/**
 * Horizontal lockup: symbol + wordmark with the official spacing (brand guide p.16).
 * Size it by height (`h-*`).
 */
export function LogoLockup({
  className,
  script = "latin",
  ...props
}: LogoProps & { script?: "latin" | "cyrillic" }) {
  return (
    <BrandSvg
      artwork={script === "cyrillic" ? EXO_LOCKUP_RU : EXO_LOCKUP}
      className={cn("h-5 w-auto", className)}
      {...props}
    />
  );
}
