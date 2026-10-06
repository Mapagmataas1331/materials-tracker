import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { StockStatus } from "@/server/services/materials";

/**
 * Stock status in brand accents: OK = Fluorescent Blue (teal),
 * low = Explorer Yellow, out = Explorer Red.
 */
const STATUS_CONFIG: Record<StockStatus, { label: string; className: string; dotClassName: string }> = {
  ok: {
    label: "В норме",
    className: "bg-brand-teal/15 text-[#06737a] dark:bg-brand-teal/15 dark:text-brand-teal",
    dotClassName: "bg-brand-teal",
  },
  low: {
    label: "Ниже минимума",
    className: "bg-brand-gold/30 text-[#6b4a00] dark:bg-brand-gold/15 dark:text-brand-gold",
    dotClassName: "bg-brand-gold ring-1 ring-[#b38600]/40",
  },
  out: {
    label: "Нет остатка",
    className: "bg-brand-red/10 text-brand-red dark:bg-brand-red/20 dark:text-[#ff5a6b]",
    dotClassName: "bg-brand-red dark:bg-[#ff3b4f]",
  },
};

export function StockStatusBadge({ status }: { status: StockStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge
      variant="secondary"
      className={cn("caps-label h-6 gap-1.5 rounded-sm px-2 text-[11px]", config.className)}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", config.dotClassName)} />
      {config.label}
    </Badge>
  );
}
