import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { StockStatus } from "@/server/services/materials";

const STATUS_CONFIG: Record<StockStatus, { label: string; className: string; dotClassName: string }> = {
  ok: {
    label: "В норме",
    className: "bg-success/10 text-success dark:bg-success/15",
    dotClassName: "bg-success",
  },
  low: {
    label: "Ниже минимума",
    className: "bg-warning/15 text-warning dark:bg-warning/20",
    dotClassName: "bg-warning",
  },
  out: {
    label: "Нет остатка",
    className: "bg-destructive/10 text-destructive dark:bg-destructive/20",
    dotClassName: "bg-destructive",
  },
};

export function StockStatusBadge({ status }: { status: StockStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="secondary" className={cn("gap-1.5", config.className)}>
      <span className={cn("size-1.5 shrink-0 rounded-full", config.dotClassName)} />
      {config.label}
    </Badge>
  );
}
