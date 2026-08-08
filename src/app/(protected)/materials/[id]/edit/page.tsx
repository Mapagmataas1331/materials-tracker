import { notFound } from "next/navigation";

import { MaterialForm } from "@/components/materials/material-form";
import { requireAdminPage } from "@/lib/current-user";
import { getMaterialById } from "@/server/services/materials";
import { listCategories, listUnits } from "@/server/services/references";

export default async function EditMaterialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;

  const [material, categories, units] = await Promise.all([
    getMaterialById(id),
    listCategories(true),
    listUnits(true),
  ]);

  if (!material) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Редактирование материала</h1>
      <MaterialForm
        categories={categories}
        units={units}
        material={{
          id: material.id,
          name: material.name,
          categoryId: material.categoryId,
          unitId: material.unitId,
          minStock: material.minStock,
          comment: material.comment,
        }}
      />
    </div>
  );
}
