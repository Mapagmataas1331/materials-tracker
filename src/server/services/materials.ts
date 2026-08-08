import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  categories,
  materialStock,
  materials,
  storageLocations,
  stockMovements,
  suppliers,
  units,
  users,
} from "@/db/schema";

export type StockStatus = "ok" | "low" | "out";

export function computeStockStatus(totalStock: number, minStock: number): StockStatus {
  if (totalStock <= 0) return "out";
  if (totalStock < minStock) return "low";
  return "ok";
}

export interface MaterialListItem {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  unitId: string;
  unitShortName: string;
  minStock: number;
  totalStock: number;
  isArchived: boolean;
  status: StockStatus;
}

export interface MaterialListFilters {
  search?: string;
  categoryId?: string;
  supplierId?: string;
  storageLocationId?: string;
  includeArchived?: boolean;
  onlyBelowMin?: boolean;
}

/**
 * Backs both the "Материалы" search (ТЗ п.9) and the "Требуется закупка"
 * list (ТЗ п.10) — the latter is simply this query with
 * `onlyBelowMin: true` and no separate table to keep in sync.
 */
export async function listMaterials(filters: MaterialListFilters = {}): Promise<MaterialListItem[]> {
  const conditions = [];

  if (!filters.includeArchived) {
    conditions.push(eq(materials.isArchived, false));
  }
  if (filters.categoryId) {
    conditions.push(eq(materials.categoryId, filters.categoryId));
  }
  if (filters.search) {
    conditions.push(ilike(materials.name, `%${filters.search}%`));
  }

  // Filtering by supplier/storage location requires narrowing to materials
  // that have at least one movement/stock row referencing them.
  let materialIdsFilter: string[] | undefined;
  if (filters.supplierId) {
    const rows = await db
      .selectDistinct({ id: stockMovements.materialId })
      .from(stockMovements)
      .where(eq(stockMovements.supplierId, filters.supplierId));
    materialIdsFilter = rows.map((r) => r.id);
  }
  if (filters.storageLocationId) {
    const rows = await db
      .selectDistinct({ id: materialStock.materialId })
      .from(materialStock)
      .where(and(eq(materialStock.storageLocationId, filters.storageLocationId), sql`${materialStock.quantity} <> 0`));
    const ids = new Set(rows.map((r) => r.id));
    materialIdsFilter = materialIdsFilter ? materialIdsFilter.filter((id) => ids.has(id)) : [...ids];
  }
  if (materialIdsFilter) {
    if (materialIdsFilter.length === 0) return [];
    conditions.push(or(...materialIdsFilter.map((id) => eq(materials.id, id))));
  }

  const rows = await db
    .select({
      id: materials.id,
      name: materials.name,
      categoryId: materials.categoryId,
      categoryName: categories.name,
      unitId: materials.unitId,
      unitShortName: units.shortName,
      minStock: materials.minStock,
      isArchived: materials.isArchived,
      totalStock: sql<string>`coalesce(sum(${materialStock.quantity}), 0)`,
    })
    .from(materials)
    .leftJoin(categories, eq(materials.categoryId, categories.id))
    .leftJoin(units, eq(materials.unitId, units.id))
    .leftJoin(materialStock, eq(materialStock.materialId, materials.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .groupBy(materials.id, categories.name, units.shortName)
    .orderBy(asc(materials.name));

  const mapped = rows.map((r) => {
    const totalStock = Number(r.totalStock);
    const minStock = Number(r.minStock);
    return {
      id: r.id,
      name: r.name,
      categoryId: r.categoryId,
      categoryName: r.categoryName ?? "—",
      unitId: r.unitId,
      unitShortName: r.unitShortName ?? "—",
      minStock,
      totalStock,
      isArchived: r.isArchived,
      status: computeStockStatus(totalStock, minStock),
    };
  });

  return filters.onlyBelowMin ? mapped.filter((m) => m.status !== "ok") : mapped;
}

/** Count of materials that need purchasing — powers the nav badge. */
export async function countPurchaseListItems(): Promise<number> {
  const items = await listMaterials({ onlyBelowMin: true });
  return items.length;
}

export async function getMaterialById(id: string) {
  const [material] = await db
    .select({
      id: materials.id,
      name: materials.name,
      categoryId: materials.categoryId,
      categoryName: categories.name,
      unitId: materials.unitId,
      unitName: units.name,
      unitShortName: units.shortName,
      minStock: materials.minStock,
      comment: materials.comment,
      isArchived: materials.isArchived,
      createdAt: materials.createdAt,
      updatedAt: materials.updatedAt,
    })
    .from(materials)
    .leftJoin(categories, eq(materials.categoryId, categories.id))
    .leftJoin(units, eq(materials.unitId, units.id))
    .where(eq(materials.id, id))
    .limit(1);

  if (!material) return null;

  const stockByLocation = await db
    .select({
      storageLocationId: materialStock.storageLocationId,
      storageLocationName: storageLocations.name,
      quantity: materialStock.quantity,
    })
    .from(materialStock)
    .innerJoin(storageLocations, eq(materialStock.storageLocationId, storageLocations.id))
    .where(and(eq(materialStock.materialId, id), sql`${materialStock.quantity} <> 0`))
    .orderBy(asc(storageLocations.name));

  const totalStock = stockByLocation.reduce((sum, row) => sum + Number(row.quantity), 0);

  return {
    ...material,
    minStock: Number(material.minStock),
    totalStock,
    status: computeStockStatus(totalStock, Number(material.minStock)),
    stockByLocation: stockByLocation.map((r) => ({ ...r, quantity: Number(r.quantity) })),
  };
}

export async function getMaterialHistory(id: string, limit = 100) {
  const rows = await db
    .select({
      id: stockMovements.id,
      type: stockMovements.type,
      quantity: stockMovements.quantity,
      unitCost: stockMovements.unitCost,
      comment: stockMovements.comment,
      balanceAfter: stockMovements.balanceAfter,
      createdAt: stockMovements.createdAt,
      storageLocationName: storageLocations.name,
      supplierName: suppliers.name,
      userName: users.fullName,
    })
    .from(stockMovements)
    .innerJoin(storageLocations, eq(stockMovements.storageLocationId, storageLocations.id))
    .leftJoin(suppliers, eq(stockMovements.supplierId, suppliers.id))
    .innerJoin(users, eq(stockMovements.userId, users.id))
    .where(eq(stockMovements.materialId, id))
    .orderBy(desc(stockMovements.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    ...r,
    quantity: Number(r.quantity),
    unitCost: r.unitCost === null ? null : Number(r.unitCost),
    balanceAfter: Number(r.balanceAfter),
  }));
}

export interface CreateMaterialInput {
  name: string;
  categoryId: string;
  unitId: string;
  minStock: number;
  comment?: string;
}

export async function createMaterial(input: CreateMaterialInput) {
  const [row] = await db
    .insert(materials)
    .values({
      name: input.name,
      categoryId: input.categoryId,
      unitId: input.unitId,
      minStock: input.minStock.toString(),
      comment: input.comment || null,
    })
    .returning();
  return row;
}

export async function updateMaterial(id: string, input: CreateMaterialInput) {
  const [row] = await db
    .update(materials)
    .set({
      name: input.name,
      categoryId: input.categoryId,
      unitId: input.unitId,
      minStock: input.minStock.toString(),
      comment: input.comment || null,
      updatedAt: new Date(),
    })
    .where(eq(materials.id, id))
    .returning();
  return row;
}

export async function setMaterialArchived(id: string, isArchived: boolean) {
  const [row] = await db
    .update(materials)
    .set({ isArchived, updatedAt: new Date() })
    .where(eq(materials.id, id))
    .returning();
  return row;
}

/** Powers the "available now" hint shown on the issue (списание) form. */
export async function getStockAtLocation(materialId: string, storageLocationId: string): Promise<number> {
  const [row] = await db
    .select({ quantity: materialStock.quantity })
    .from(materialStock)
    .where(and(eq(materialStock.materialId, materialId), eq(materialStock.storageLocationId, storageLocationId)));
  return row ? Number(row.quantity) : 0;
}

/** Lightweight autocomplete source for the receipt/issue forms (ТЗ п.7). */
export async function searchMaterialsForAutocomplete(query: string, limit = 15) {
  if (!query.trim()) {
    return db
      .select({ id: materials.id, name: materials.name, unitShortName: units.shortName })
      .from(materials)
      .leftJoin(units, eq(materials.unitId, units.id))
      .where(eq(materials.isArchived, false))
      .orderBy(asc(materials.name))
      .limit(limit);
  }

  return db
    .select({ id: materials.id, name: materials.name, unitShortName: units.shortName })
    .from(materials)
    .leftJoin(units, eq(materials.unitId, units.id))
    .where(and(eq(materials.isArchived, false), ilike(materials.name, `%${query}%`)))
    .orderBy(asc(materials.name))
    .limit(limit);
}
