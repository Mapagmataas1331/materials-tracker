import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatQuantity } from "@/lib/format";

interface Row {
  id: string;
  quantity: number;
  comment: string | null;
  balanceAfter: number;
  createdAt: Date;
  materialName: string;
  unitShortName: string | null;
  storageLocationName: string;
  supplierName: string | null;
  userName: string;
}

export function RecentMovementsTable({ rows, showSupplier }: { rows: Row[]; showSupplier: boolean }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Пока нет операций.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Дата</TableHead>
            <TableHead>Материал</TableHead>
            <TableHead className="hidden sm:table-cell">Место хранения</TableHead>
            <TableHead className="text-right">Кол-во</TableHead>
            {showSupplier && <TableHead className="hidden md:table-cell">Поставщик</TableHead>}
            <TableHead className="hidden md:table-cell">Пользователь</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatDateTime(row.createdAt)}
              </TableCell>
              <TableCell className="max-w-[9rem] font-medium whitespace-normal sm:max-w-none">
                {row.materialName}
              </TableCell>
              <TableCell className="hidden sm:table-cell">{row.storageLocationName}</TableCell>
              <TableCell className="text-right whitespace-nowrap">
                {formatQuantity(row.quantity)} {row.unitShortName}
              </TableCell>
              {showSupplier && (
                <TableCell className="hidden md:table-cell">{row.supplierName ?? "—"}</TableCell>
              )}
              <TableCell className="hidden md:table-cell">{row.userName}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
