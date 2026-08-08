import { MaterialsTable } from "@/components/materials/materials-table";
import { PurchaseListActions } from "@/components/materials/purchase-list-actions";
import { listMaterials } from "@/server/services/materials";

export default async function PurchaseListPage() {
  const materials = await listMaterials({ onlyBelowMin: true });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold break-words print:hidden">Требуется закупка</h1>
          <p className="text-sm text-muted-foreground print:hidden">
            Материалы, остаток которых равен нулю или ниже установленного минимального остатка.
            Список формируется автоматически и не требует ручного ведения.
          </p>
        </div>
        <PurchaseListActions materials={materials} />
      </div>
      <div className="print:hidden">
        <MaterialsTable materials={materials} />
      </div>
    </div>
  );
}
