import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { materialStock, materials, storageLocations, stockMovements, suppliers, units, users } from "@/db/schema";

export class InsufficientStockError extends Error {
  constructor(available: number, requested: number) {
    super(`Недостаточно остатка: доступно ${available}, запрошено ${requested}`);
    this.name = "InsufficientStockError";
  }
}

export interface CreateReceiptInput {
  materialId: string;
  storageLocationId: string;
  quantity: number;
  unitCost?: number;
  supplierId: string;
  comment?: string;
  userId: string;
}

/**
 * Приход материала (ТЗ п.7). The `INSERT ... ON CONFLICT DO UPDATE`
 * statement is executed atomically by Postgres: even if two receipts for
 * the same material+location land at the exact same millisecond from two
 * different users, Postgres serialises them at the row level and both
 * increments are applied correctly — no explicit locking code needed.
 */
export async function createReceipt(input: CreateReceiptInput) {
  return db.transaction(async (tx) => {
    const [stockRow] = await tx
      .insert(materialStock)
      .values({
        materialId: input.materialId,
        storageLocationId: input.storageLocationId,
        quantity: input.quantity.toString(),
      })
      .onConflictDoUpdate({
        target: [materialStock.materialId, materialStock.storageLocationId],
        set: { quantity: sql`${materialStock.quantity} + ${input.quantity}` },
      })
      .returning({ quantity: materialStock.quantity });

    const [movement] = await tx
      .insert(stockMovements)
      .values({
        type: "receipt",
        materialId: input.materialId,
        storageLocationId: input.storageLocationId,
        quantity: input.quantity.toString(),
        unitCost: input.unitCost !== undefined ? input.unitCost.toString() : null,
        supplierId: input.supplierId,
        userId: input.userId,
        comment: input.comment || null,
        balanceAfter: stockRow.quantity,
      })
      .returning();

    return movement;
  });
}

/** Recent-activity feed shown on the Поступления/Списания pages. */
export async function listRecentMovements(type: "receipt" | "issue", limit = 25) {
  const rows = await db
    .select({
      id: stockMovements.id,
      quantity: stockMovements.quantity,
      unitCost: stockMovements.unitCost,
      comment: stockMovements.comment,
      balanceAfter: stockMovements.balanceAfter,
      createdAt: stockMovements.createdAt,
      materialName: materials.name,
      unitShortName: units.shortName,
      storageLocationName: storageLocations.name,
      supplierName: suppliers.name,
      userName: users.fullName,
    })
    .from(stockMovements)
    .innerJoin(materials, eq(stockMovements.materialId, materials.id))
    .leftJoin(units, eq(materials.unitId, units.id))
    .innerJoin(storageLocations, eq(stockMovements.storageLocationId, storageLocations.id))
    .leftJoin(suppliers, eq(stockMovements.supplierId, suppliers.id))
    .innerJoin(users, eq(stockMovements.userId, users.id))
    .where(eq(stockMovements.type, type))
    .orderBy(desc(stockMovements.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    ...r,
    quantity: Number(r.quantity),
    unitCost: r.unitCost === null ? null : Number(r.unitCost),
    balanceAfter: Number(r.balanceAfter),
  }));
}

export interface CreateIssueInput {
  materialId: string;
  storageLocationId: string;
  quantity: number;
  comment?: string;
  userId: string;
}

/**
 * Списание материала (ТЗ п.8). The guarded `UPDATE ... WHERE quantity >=
 * $qty` is the piece that makes "запрет списания сверх остатка" airtight
 * under concurrency: Postgres takes a row lock for the duration of the
 * UPDATE, so if two users try to issue the last unit of stock at the same
 * time, the second one always re-evaluates the WHERE clause against the
 * already-decremented value and correctly gets zero rows back.
 */
export async function createIssue(input: CreateIssueInput) {
  return db.transaction(async (tx) => {
    const [stockRow] = await tx
      .update(materialStock)
      .set({ quantity: sql`${materialStock.quantity} - ${input.quantity}` })
      .where(
        and(
          eq(materialStock.materialId, input.materialId),
          eq(materialStock.storageLocationId, input.storageLocationId),
          sql`${materialStock.quantity} >= ${input.quantity}`
        )
      )
      .returning({ quantity: materialStock.quantity });

    if (!stockRow) {
      const [existing] = await tx
        .select({ quantity: materialStock.quantity })
        .from(materialStock)
        .where(
          and(
            eq(materialStock.materialId, input.materialId),
            eq(materialStock.storageLocationId, input.storageLocationId)
          )
        );
      throw new InsufficientStockError(existing ? Number(existing.quantity) : 0, input.quantity);
    }

    const [movement] = await tx
      .insert(stockMovements)
      .values({
        type: "issue",
        materialId: input.materialId,
        storageLocationId: input.storageLocationId,
        quantity: input.quantity.toString(),
        userId: input.userId,
        comment: input.comment || null,
        balanceAfter: stockRow.quantity,
      })
      .returning();

    return movement;
  });
}
