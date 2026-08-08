import { requireAdminPage } from "@/lib/current-user";
import { MaterialForm } from "@/components/materials/material-form";
import { listCategories, listUnits } from "@/server/services/references";

export default async function NewMaterialPage() {
  await requireAdminPage();
  const [categories, units] = await Promise.all([listCategories(), listUnits()]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Новый материал</h1>
      <MaterialForm categories={categories} units={units} />
    </div>
  );
}
