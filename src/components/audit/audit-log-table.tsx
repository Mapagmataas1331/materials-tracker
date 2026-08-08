import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";

const ENTITY_LABELS: Record<string, string> = {
  material: "Материал",
  category: "Категория",
  unit: "Ед. изм.",
  supplier: "Поставщик",
  storage_location: "Место хранения",
  user: "Пользователь",
};

const ACTION_LABELS: Record<string, string> = {
  create: "Создание",
  update: "Изменение",
  archive: "В архив",
  restore: "Из архива",
  password_change: "Смена пароля",
  password_change_self: "Смена своего пароля",
};

function summarizeChanges(changes: unknown): string {
  if (!changes || typeof changes !== "object") return "—";
  const entries = Object.entries(changes as Record<string, unknown>).filter(
    ([, value]) => value !== undefined && value !== null && value !== "",
  );
  if (entries.length === 0) return "—";
  return entries
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`)
    .join("; ");
}

export function AuditLogTable({
  rows,
}: {
  rows: {
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    changes: unknown;
    createdAt: Date;
    userName: string;
    userLogin: string;
  }[];
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Записей в журнале пока нет.
      </div>
    );
  }

  return (
    <div className="min-w-0 w-full overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Дата</TableHead>
            <TableHead>Пользователь</TableHead>
            <TableHead>Объект</TableHead>
            <TableHead>Действие</TableHead>
            <TableHead className="hidden md:table-cell">Детали</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatDateTime(row.createdAt)}
              </TableCell>
              <TableCell>
                <div className="font-medium">{row.userName}</div>
                <div className="text-xs text-muted-foreground">{row.userLogin}</div>
              </TableCell>
              <TableCell>
                <div>{ENTITY_LABELS[row.entityType] ?? row.entityType}</div>
                <div className="max-w-[8rem] truncate font-mono text-xs text-muted-foreground" title={row.entityId}>
                  {row.entityId.slice(0, 8)}…
                </div>
              </TableCell>
              <TableCell>{ACTION_LABELS[row.action] ?? row.action}</TableCell>
              <TableCell
                className="hidden max-w-xs truncate md:table-cell"
                title={summarizeChanges(row.changes)}
              >
                {summarizeChanges(row.changes)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
