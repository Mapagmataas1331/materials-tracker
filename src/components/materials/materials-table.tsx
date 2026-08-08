import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StockStatusBadge } from "@/components/materials/stock-status-badge";
import { formatQuantity } from "@/lib/format";
import type { MaterialListItem } from "@/server/services/materials";

export function MaterialsTable({
  materials,
  showArchivedBadge = false,
}: {
  materials: MaterialListItem[];
  showArchivedBadge?: boolean;
}) {
  if (materials.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        Ничего не найдено. Попробуйте изменить условия поиска.
      </div>
    );
  }

  return (
    <div className="min-w-0 w-full overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Наименование</TableHead>
            <TableHead className="hidden md:table-cell">Категория</TableHead>
            <TableHead className="text-right">Остаток</TableHead>
            <TableHead className="hidden text-right md:table-cell">Мин. остаток</TableHead>
            <TableHead>Статус</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.map((material) => (
            <TableRow
              key={material.id}
              className={material.isArchived ? "cursor-pointer opacity-60" : "cursor-pointer"}
            >
              <TableCell className="max-w-[10rem] font-medium whitespace-normal sm:max-w-none">
                <Link href={`/materials/${material.id}`} className="block">
                  {material.name}
                  {showArchivedBadge && material.isArchived && (
                    <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
                      архив
                    </span>
                  )}
                </Link>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Link href={`/materials/${material.id}`} className="block text-muted-foreground">
                  {material.categoryName}
                </Link>
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/materials/${material.id}`} className="block">
                  {formatQuantity(material.totalStock)} {material.unitShortName}
                </Link>
              </TableCell>
              <TableCell className="hidden text-right text-muted-foreground md:table-cell">
                <Link href={`/materials/${material.id}`} className="block">
                  {formatQuantity(material.minStock)} {material.unitShortName}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/materials/${material.id}`} className="block">
                  <StockStatusBadge status={material.status} />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
