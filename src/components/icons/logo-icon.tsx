import type { SVGProps } from "react";

/**
 * Brand mark used throughout the UI (login page, sidebar, mobile nav) and as
 * the source for the favicon (src/app/icon.svg). Uses `fill="currentColor"`
 * like lucide-react icons, so it follows whatever text color class it's
 * given — e.g. `text-foreground` makes it black in light theme, white in
 * dark theme.
 */
export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M100,50c0,18.29-9.83,34.3-24.5,43.01v-23.15l21.5-5.86-21.5-5.86V24.25h-.51l-24.99,23.75-24.99-23.75h-.51v68.76C9.83,84.3,0,68.29,0,50,0,22.39,22.39,0,50,0s50,22.39,50,50Z" />
      <polygon points="75.5 58.14 75.5 69.86 53 76 53 52 75.5 58.14" />
    </svg>
  );
}
