import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MaterialsFilterBar } from "@/components/materials/materials-filter-bar";
import { MaterialsTable } from "@/components/materials/materials-table";
import { requireUser } from "@/lib/current-user";
import { listMaterials } from "@/server/services/materials";
import { listCategories, listStorageLocations } from "@/server/services/references";

export default async function MaterialsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; location?: string }>;
}) {
  const user = await requireUser();
  const { q, category, location } = await searchParams;

  const [materials, categories, storageLocations] = await Promise.all([
    listMaterials({ search: q, categoryId: category, storageLocationId: location }),
    listCategories(),
    listStorageLocations(),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Материалы</h1>
          <p className="text-sm text-muted-foreground">
            {materials.length} {materials.length === 1 ? "материал" : "материалов"} найдено
          </p>
        </div>
        {user.role === "admin" && (
          <Button
            className="w-full sm:w-auto"
            render={<Link href="/materials/new" />}
            nativeButton={false}
          >
            <Plus />
            Новый материал
          </Button>
        )}
      </div>

      <MaterialsFilterBar categories={categories} storageLocations={storageLocations} />

      <MaterialsTable materials={materials} />
    </div>
  );
}
