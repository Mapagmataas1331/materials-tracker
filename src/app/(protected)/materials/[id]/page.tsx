import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StockStatusBadge } from "@/components/materials/stock-status-badge";
import { ArchiveMaterialButton } from "@/components/materials/archive-material-button";
import { requireUser } from "@/lib/current-user";
import { formatDateTime, formatQuantity, MOVEMENT_TYPE_LABELS } from "@/lib/format";
import { getMaterialById, getMaterialHistory } from "@/server/services/materials";

export default async function MaterialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const material = await getMaterialById(id);
  if (!material) notFound();

  const history = await getMaterialHistory(id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold break-words">{material.name}</h1>
            {material.isArchived && (
              <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                В архиве
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {material.categoryName} · {material.unitName}
          </p>
        </div>
        {user.role === "admin" && (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              render={<Link href={`/materials/${material.id}/edit`} />}
              nativeButton={false}
            >
              <Pencil />
              Редактировать
            </Button>
            <ArchiveMaterialButton materialId={material.id} isArchived={material.isArchived} />
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Общий остаток</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatQuantity(material.totalStock)} {material.unitShortName}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Минимальный остаток</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatQuantity(material.minStock)} {material.unitShortName}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Статус запаса</CardTitle>
          </CardHeader>
          <CardContent>
            <StockStatusBadge status={material.status} />
          </CardContent>
        </Card>
      </div>

      {material.comment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Комментарий</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{material.comment}</CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Остатки по местам хранения</h2>
        {material.stockByLocation.length === 0 ? (
          <p className="text-sm text-muted-foreground">Остатков нет.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Место хранения</TableHead>
                  <TableHead className="text-right">Количество</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {material.stockByLocation.map((row) => (
                  <TableRow key={row.storageLocationId}>
                    <TableCell>{row.storageLocationName}</TableCell>
                    <TableCell className="text-right">
                      {formatQuantity(row.quantity)} {material.unitShortName}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">История операций</h2>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Операций пока не было.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата и время</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead className="hidden sm:table-cell">Место хранения</TableHead>
                  <TableHead className="text-right">Количество</TableHead>
                  <TableHead className="hidden text-right md:table-cell">Остаток после</TableHead>
                  <TableHead className="hidden md:table-cell">Поставщик</TableHead>
                  <TableHead className="hidden lg:table-cell">Пользователь</TableHead>
                  <TableHead className="hidden lg:table-cell">Комментарий</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap">{formatDateTime(row.createdAt)}</TableCell>
                    <TableCell className="whitespace-nowrap">{MOVEMENT_TYPE_LABELS[row.type] ?? row.type}</TableCell>
                    <TableCell className="hidden sm:table-cell">{row.storageLocationName}</TableCell>
                    <TableCell className="text-right">
                      {row.type === "issue" ? "-" : "+"}
                      {formatQuantity(row.quantity)} {material.unitShortName}
                    </TableCell>
                    <TableCell className="hidden text-right md:table-cell">
                      {formatQuantity(row.balanceAfter)} {material.unitShortName}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{row.supplierName ?? "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell">{row.userName}</TableCell>
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
        )}
      </div>
    </div>
  );
}
