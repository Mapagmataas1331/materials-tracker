import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { categories, storageLocations, suppliers, units } from "@/db/schema";

/**
 * Reference tables (ТЗ п.5) are intentionally never hard-deleted — only
 * archived. A material or a historical stock movement may still point at
 * an archived category/supplier/location, and deleting the row would
 * either orphan foreign keys or force us to delete history, which the ТЗ
 * explicitly forbids (п.4, п.13). Archived items are simply hidden from
 * pick-lists / autocomplete for new documents.
 */

export async function listCategories(includeArchived = false) {
  const rows = await db.select().from(categories).orderBy(asc(categories.name));
  return includeArchived ? rows : rows.filter((r) => !r.isArchived);
}

export async function createCategory(name: string) {
  const [row] = await db.insert(categories).values({ name }).returning();
  return row;
}

export async function setCategoryArchived(id: string, isArchived: boolean) {
  const [row] = await db
    .update(categories)
    .set({ isArchived })
    .where(eq(categories.id, id))
    .returning();
  return row;
}

export async function listUnits(includeArchived = false) {
  const rows = await db.select().from(units).orderBy(asc(units.name));
  return includeArchived ? rows : rows.filter((r) => !r.isArchived);
}

export async function createUnit(name: string, shortName: string) {
  const [row] = await db.insert(units).values({ name, shortName }).returning();
  return row;
}

export async function setUnitArchived(id: string, isArchived: boolean) {
  const [row] = await db.update(units).set({ isArchived }).where(eq(units.id, id)).returning();
  return row;
}

export async function listSuppliers(includeArchived = false) {
  const rows = await db.select().from(suppliers).orderBy(asc(suppliers.name));
  return includeArchived ? rows : rows.filter((r) => !r.isArchived);
}

export async function createSupplier(name: string, contactInfo?: string) {
  const [row] = await db
    .insert(suppliers)
    .values({ name, contactInfo: contactInfo || null })
    .returning();
  return row;
}

export async function setSupplierArchived(id: string, isArchived: boolean) {
  const [row] = await db
    .update(suppliers)
    .set({ isArchived })
    .where(eq(suppliers.id, id))
    .returning();
  return row;
}

export async function listStorageLocations(includeArchived = false) {
  const rows = await db.select().from(storageLocations).orderBy(asc(storageLocations.name));
  return includeArchived ? rows : rows.filter((r) => !r.isArchived);
}

export async function createStorageLocation(name: string) {
  const [row] = await db.insert(storageLocations).values({ name }).returning();
  return row;
}

export async function setStorageLocationArchived(id: string, isArchived: boolean) {
  const [row] = await db
    .update(storageLocations)
    .set({ isArchived })
    .where(eq(storageLocations.id, id))
    .returning();
  return row;
}
