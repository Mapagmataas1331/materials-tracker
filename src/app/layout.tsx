import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Roboto_Condensed, Unbounded } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

/**
 * Typography per Exomaterial brand guide V1.01 («Типографика», p.36–38).
 * The brand family is Pragmatica Next (ParaType, commercial). No licensed font
 * files exist on this machine or in the guide pack (the PDF only carries
 * Ghostscript Type 3 glyph outlines, which are neither usable nor licensed as
 * webfonts), so each documented style is mapped to the closest open-licence
 * (OFL) Cyrillic-capable face:
 *
 *   Pragmatica Next M 400/800   (body, UI text)        → Inter
 *   Pragmatica Next XS 600/800  (headings, labels, CAPS) → Roboto Condensed
 *   Pragmatica Next XXL 900     (display / slogans)    → Unbounded
 *
 * The EXOMATERIAL wordmark itself is never typeset — it is rendered from the
 * official vector outlines (see components/icons/logo-icon.tsx).
 * To switch to real Pragmatica Next later, load it via next/font/local into the
 * same CSS variables.
 */
const sans = Inter({
  variable: "--font-sans-family",
  subsets: ["latin", "cyrillic"],
});

const heading = Roboto_Condensed({
  variable: "--font-heading-family",
  subsets: ["latin", "cyrillic"],
});

const display = Unbounded({
  variable: "--font-display-family",
  subsets: ["latin", "cyrillic"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono-family",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Учёт материалов",
  description: "Внутренняя система учёта материалов на производстве",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F8FA" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0B0B" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${sans.variable} ${heading.variable} ${display.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
      </head>
      <body className="flex min-h-full flex-col bg-background">
        <ThemeProvider>
          <TooltipProvider delay={200}>
            {children}
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
