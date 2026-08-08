import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ReferenceSection } from "@/components/references/reference-section";
import { requireAdminPage } from "@/lib/current-user";
import {
  listCategories,
  listStorageLocations,
  listSuppliers,
  listUnits,
} from "@/server/services/references";
import {
  createCategoryRefAction,
  createStorageLocationRefAction,
  createSupplierRefAction,
  createUnitRefAction,
  setCategoryArchivedAction,
  setStorageLocationArchivedAction,
  setSupplierArchivedAction,
  setUnitArchivedAction,
  updateCategoryRefAction,
  updateStorageLocationRefAction,
  updateSupplierRefAction,
  updateUnitRefAction,
} from "@/server/actions/references";

export default async function SettingsPage() {
  await requireAdminPage();

  const [categories, units, suppliers, storageLocations] = await Promise.all([
    listCategories(true),
    listUnits(true),
    listSuppliers(true),
    listStorageLocations(true),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Настройки — справочники</h1>
        <p className="text-sm text-muted-foreground">
          Категории, единицы измерения, поставщики и места хранения. Записи не удаляются, а переносятся
          в архив и перестают предлагаться в новых документах.
        </p>
      </div>

      <Tabs defaultValue="categories">
        <div className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:px-0">
          <TabsList>
            <TabsTrigger value="categories">Категории</TabsTrigger>
            <TabsTrigger value="units">Единицы измерения</TabsTrigger>
            <TabsTrigger value="suppliers">Поставщики</TabsTrigger>
            <TabsTrigger value="locations">Места хранения</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="categories">
          <ReferenceSection
            title="Категории материалов"
            items={categories.map((c) => ({ id: c.id, name: c.name, isArchived: c.isArchived }))}
            onCreate={createCategoryRefAction}
            onUpdate={updateCategoryRefAction}
            onToggleArchived={setCategoryArchivedAction}
          />
        </TabsContent>

        <TabsContent value="units">
          <ReferenceSection
            title="Единицы измерения"
            extraField={{ key: "shortName", label: "Сокращение", placeholder: "кг, шт, м..." }}
            items={units.map((u) => ({ id: u.id, name: u.name, isArchived: u.isArchived, extra: u.shortName }))}
            onCreate={createUnitRefAction}
            onUpdate={updateUnitRefAction}
            onToggleArchived={setUnitArchivedAction}
          />
        </TabsContent>

        <TabsContent value="suppliers">
          <ReferenceSection
            title="Поставщики"
            extraField={{ key: "contactInfo", label: "Контакты", placeholder: "Телефон, email..." }}
            items={suppliers.map((s) => ({ id: s.id, name: s.name, isArchived: s.isArchived, extra: s.contactInfo }))}
            onCreate={createSupplierRefAction}
            onUpdate={updateSupplierRefAction}
            onToggleArchived={setSupplierArchivedAction}
          />
        </TabsContent>

        <TabsContent value="locations">
          <ReferenceSection
            title="Места хранения"
            items={storageLocations.map((l) => ({ id: l.id, name: l.name, isArchived: l.isArchived }))}
            onCreate={createStorageLocationRefAction}
            onUpdate={updateStorageLocationRefAction}
            onToggleArchived={setStorageLocationArchivedAction}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
