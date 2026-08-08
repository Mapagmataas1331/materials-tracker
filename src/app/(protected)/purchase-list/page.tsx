import { MaterialsTable } from "@/components/materials/materials-table";
import { listMaterials } from "@/server/services/materials";

export default async function PurchaseListPage() {
  const materials = await listMaterials({ onlyBelowMin: true });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold break-words">Требуется закупка</h1>
        <p className="text-sm text-muted-foreground">
          Материалы, остаток которых равен нулю или ниже установленного минимального остатка.
          Список формируется автоматически и не требует ручного ведения.
        </p>
      </div>
      <MaterialsTable materials={materials} />
    </div>
  );
}
