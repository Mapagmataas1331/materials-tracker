import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReceiptForm } from "@/components/movements/receipt-form";
import { RecentMovementsTable } from "@/components/movements/recent-movements-table";
import { listRecentMovements } from "@/server/services/movements";
import { listStorageLocations, listSuppliers } from "@/server/services/references";

export default async function ReceiptsPage() {
  const [storageLocations, suppliers, recent] = await Promise.all([
    listStorageLocations(),
    listSuppliers(),
    listRecentMovements("receipt"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Поступления материалов</h1>
        <p className="text-sm text-muted-foreground">
          Оформите приход материала на склад. Остаток обновится сразу после сохранения.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Новое поступление</CardTitle>
          </CardHeader>
          <CardContent>
            <ReceiptForm storageLocations={storageLocations} suppliers={suppliers} />
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Последние поступления</h2>
          <RecentMovementsTable rows={recent} showSupplier />
        </div>
      </div>
    </div>
  );
}
