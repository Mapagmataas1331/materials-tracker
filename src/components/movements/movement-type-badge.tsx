import { cn } from "@/lib/utils";
import { MOVEMENT_TYPE_LABELS } from "@/lib/format";

/** Brand-coded movement types: receipt = Fluorescent Blue, issue = Explorer Orange, adjustment = Indigo. */
const TYPE_STYLES: Record<string, { badge: string; dot: string }> = {
  receipt: {
    badge: "bg-brand-teal/15 text-[#06737a] dark:bg-brand-teal/15 dark:text-brand-teal",
    dot: "bg-brand-teal",
  },
  issue: {
    badge: "bg-brand-orange/10 text-[#c2320b] dark:bg-brand-orange/15 dark:text-[#ff7a52]",
    dot: "bg-brand-orange",
  },
  adjustment: {
    badge: "bg-brand-navy/10 text-brand-navy dark:bg-brand-defense-blue/15 dark:text-[#7cbcff]",
    dot: "bg-brand-navy dark:bg-brand-defense-blue",
  },
};

export function MovementTypeBadge({ type, className }: { type: string; className?: string }) {
  const style = TYPE_STYLES[type] ?? { badge: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" };
  return (
    <span
      className={cn(
        "caps-label inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-[11px] leading-none",
        style.badge,
        className,
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", style.dot)} aria-hidden />
      {MOVEMENT_TYPE_LABELS[type] ?? type}
    </span>
  );
}
