import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { absoluteQuantity, movementQuantitySign } from "@/lib/decimal";
import { formatDateTime, formatQuantity, MOVEMENT_TYPE_LABELS } from "@/lib/format";
import type { JournalMovementRow } from "@/server/services/movements";

export function JournalTable({ rows }: { rows: JournalMovementRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        Операций по выбранным фильтрам не найдено.
      </div>
    );
  }

  return (
    <div className="min-w-0 w-full overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Дата</TableHead>
            <TableHead>Тип</TableHead>
            <TableHead>Материал</TableHead>
            <TableHead className="hidden sm:table-cell">Место</TableHead>
            <TableHead className="text-right">Кол-во</TableHead>
            <TableHead className="hidden text-right md:table-cell">Остаток</TableHead>
            <TableHead className="hidden md:table-cell">Пользователь</TableHead>
            <TableHead className="hidden lg:table-cell">Комментарий</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatDateTime(row.createdAt)}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {MOVEMENT_TYPE_LABELS[row.type] ?? row.type}
              </TableCell>
              <TableCell className="max-w-[10rem] font-medium whitespace-normal sm:max-w-none">
                <Link href={`/materials/${row.materialId}`} className="hover:underline">
                  {row.materialName}
                </Link>
              </TableCell>
              <TableCell className="hidden sm:table-cell">{row.storageLocationName}</TableCell>
              <TableCell className="text-right whitespace-nowrap">
                {movementQuantitySign(row.type, row.quantity)}
                {formatQuantity(absoluteQuantity(row.quantity))} {row.unitShortName}
              </TableCell>
              <TableCell className="hidden text-right whitespace-nowrap md:table-cell">
                {formatQuantity(row.balanceAfter)} {row.unitShortName}
              </TableCell>
              <TableCell className="hidden md:table-cell">{row.userName}</TableCell>
              <TableCell
                className="hidden max-w-48 truncate lg:table-cell"
                title={row.comment ?? undefined}
              >
                {row.comment ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
