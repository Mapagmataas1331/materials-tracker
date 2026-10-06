import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Exomaterial brand mark (login, sidebar, mobile nav, favicon source).
 * Uses `fill="currentColor"` so callers set color via text-* classes.
 * Brand guide: keep clear space and do not render smaller than 24px.
 */
export function LogoIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-6 shrink-0", className)}
      {...props}
      aria-hidden={props["aria-hidden"] ?? true}
    >
      <path d="M100,50c0,18.29-9.83,34.3-24.5,43.01v-23.15l21.5-5.86-21.5-5.86V24.25h-.51l-24.99,23.75-24.99-23.75h-.51v68.76C9.83,84.3,0,68.29,0,50,0,22.39,22.39,0,50,0s50,22.39,50,50Z" />
      <polygon points="75.5 58.14 75.5 69.86 53 76 53 52 75.5 58.14" />
    </svg>
  );
}
