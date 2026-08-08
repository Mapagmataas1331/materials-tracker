import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { toDecimalString } from "@/lib/decimal";
import { materialStock, materials, storageLocations, stockMovements, suppliers, units, users } from "@/db/schema";

export class InsufficientStockError extends Error {
  constructor(available: number, requested: number) {
    super(`Недостаточно остатка: доступно ${available}, запрошено ${requested}`);
    this.name = "InsufficientStockError";
  }
}

export class InactiveReferenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InactiveReferenceError";
  }
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function assertActiveMaterial(tx: Tx, materialId: string) {
  const [row] = await tx
    .select({ id: materials.id, isArchived: materials.isArchived })
    .from(materials)
    .where(eq(materials.id, materialId))
    .limit(1);
  if (!row) throw new InactiveReferenceError("Материал не найден");
  if (row.isArchived) throw new InactiveReferenceError("Нельзя оформить операцию по архивному материалу");
}

async function assertActiveStorageLocation(tx: Tx, storageLocationId: string) {
  const [row] = await tx
    .select({ id: storageLocations.id, isArchived: storageLocations.isArchived })
    .from(storageLocations)
    .where(eq(storageLocations.id, storageLocationId))
    .limit(1);
  if (!row) throw new InactiveReferenceError("Место хранения не найдено");
  if (row.isArchived) throw new InactiveReferenceError("Место хранения в архиве");
}

async function assertActiveSupplier(tx: Tx, supplierId: string) {
  const [row] = await tx
    .select({ id: suppliers.id, isArchived: suppliers.isArchived })
    .from(suppliers)
    .where(eq(suppliers.id, supplierId))
    .limit(1);
  if (!row) throw new InactiveReferenceError("Поставщик не найден");
  if (row.isArchived) throw new InactiveReferenceError("Поставщик в архиве");
}

async function getLocationQuantity(
  tx: Tx,
  materialId: string,
  storageLocationId: string,
): Promise<number> {
  const [existing] = await tx
    .select({ quantity: materialStock.quantity })
    .from(materialStock)
    .where(
      and(
        eq(materialStock.materialId, materialId),
        eq(materialStock.storageLocationId, storageLocationId),
      ),
    );
  return existing ? Number(existing.quantity) : 0;
}

async function increaseStock(
  tx: Tx,
  materialId: string,
  storageLocationId: string,
  qty: string,
) {
  const [stockRow] = await tx
    .insert(materialStock)
    .values({
      materialId,
      storageLocationId,
      quantity: qty,
    })
    .onConflictDoUpdate({
      target: [materialStock.materialId, materialStock.storageLocationId],
      set: { quantity: sql`${materialStock.quantity} + ${qty}::numeric` },
    })
    .returning({ quantity: materialStock.quantity });
  return stockRow;
}

async function decreaseStock(
  tx: Tx,
  materialId: string,
  storageLocationId: string,
  qty: string,
  requested: number,
) {
  const [stockRow] = await tx
    .update(materialStock)
    .set({ quantity: sql`${materialStock.quantity} - ${qty}::numeric` })
    .where(
      and(
        eq(materialStock.materialId, materialId),
        eq(materialStock.storageLocationId, storageLocationId),
        sql`${materialStock.quantity} >= ${qty}::numeric`,
      ),
    )
    .returning({ quantity: materialStock.quantity });

  if (!stockRow) {
    const available = await getLocationQuantity(tx, materialId, storageLocationId);
    throw new InsufficientStockError(available, requested);
  }
  return stockRow;
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
  const qty = toDecimalString(input.quantity);
  return db.transaction(async (tx) => {
    await assertActiveMaterial(tx, input.materialId);
    await assertActiveStorageLocation(tx, input.storageLocationId);
    await assertActiveSupplier(tx, input.supplierId);

    const stockRow = await increaseStock(tx, input.materialId, input.storageLocationId, qty);

    const [movement] = await tx
      .insert(stockMovements)
      .values({
        type: "receipt",
        materialId: input.materialId,
        storageLocationId: input.storageLocationId,
        quantity: qty,
        unitCost: input.unitCost !== undefined ? toDecimalString(input.unitCost, 2) : null,
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
  const qty = toDecimalString(input.quantity);
  return db.transaction(async (tx) => {
    await assertActiveMaterial(tx, input.materialId);
    await assertActiveStorageLocation(tx, input.storageLocationId);

    const stockRow = await decreaseStock(
      tx,
      input.materialId,
      input.storageLocationId,
      qty,
      input.quantity,
    );

    const [movement] = await tx
      .insert(stockMovements)
      .values({
        type: "issue",
        materialId: input.materialId,
        storageLocationId: input.storageLocationId,
        quantity: qty,
        userId: input.userId,
        comment: input.comment || null,
        balanceAfter: stockRow.quantity,
      })
      .returning();

    return movement;
  });
}

export interface CreateAdjustmentInput {
  materialId: string;
  storageLocationId: string;
  /** Absolute stock quantity after inventory count. */
  newQuantity: number;
  comment: string;
  userId: string;
}

/**
 * Inventory correction: set stock at a location to an absolute quantity.
 * Ledger stores a signed delta under type `adjustment`.
 */
export async function createAdjustment(input: CreateAdjustmentInput) {
  const newQty = toDecimalString(input.newQuantity);
  return db.transaction(async (tx) => {
    await assertActiveMaterial(tx, input.materialId);
    await assertActiveStorageLocation(tx, input.storageLocationId);

    const current = await getLocationQuantity(tx, input.materialId, input.storageLocationId);
    const delta = input.newQuantity - current;
    if (Math.abs(delta) < 0.0005) {
      throw new InactiveReferenceError("Новый остаток совпадает с текущим — корректировка не нужна");
    }

    const absDelta = toDecimalString(Math.abs(delta));
    if (delta > 0) {
      await increaseStock(tx, input.materialId, input.storageLocationId, absDelta);
    } else {
      await decreaseStock(
        tx,
        input.materialId,
        input.storageLocationId,
        absDelta,
        Math.abs(delta),
      );
    }

    const [movement] = await tx
      .insert(stockMovements)
      .values({
        type: "adjustment",
        materialId: input.materialId,
        storageLocationId: input.storageLocationId,
        quantity: toDecimalString(delta),
        userId: input.userId,
        comment: input.comment,
        balanceAfter: newQty,
      })
      .returning();

    return { movement, previousQuantity: current, balanceAfter: input.newQuantity };
  });
}

export interface CreateTransferInput {
  materialId: string;
  fromStorageLocationId: string;
  toStorageLocationId: string;
  quantity: number;
  comment?: string;
  userId: string;
}

/** Move stock between locations in one transaction (two adjustment legs). */
export async function createTransfer(input: CreateTransferInput) {
  if (input.fromStorageLocationId === input.toStorageLocationId) {
    throw new InactiveReferenceError("Выберите разные места хранения");
  }

  const qty = toDecimalString(input.quantity);
  return db.transaction(async (tx) => {
    await assertActiveMaterial(tx, input.materialId);
    await assertActiveStorageLocation(tx, input.fromStorageLocationId);
    await assertActiveStorageLocation(tx, input.toStorageLocationId);

    const [fromLoc] = await tx
      .select({ name: storageLocations.name })
      .from(storageLocations)
      .where(eq(storageLocations.id, input.fromStorageLocationId))
      .limit(1);
    const [toLoc] = await tx
      .select({ name: storageLocations.name })
      .from(storageLocations)
      .where(eq(storageLocations.id, input.toStorageLocationId))
      .limit(1);

    const fromBalance = await decreaseStock(
      tx,
      input.materialId,
      input.fromStorageLocationId,
      qty,
      input.quantity,
    );
    const toBalance = await increaseStock(
      tx,
      input.materialId,
      input.toStorageLocationId,
      qty,
    );

    const note = input.comment?.trim();
    const fromComment = note
      ? `Перемещение → ${toLoc?.name ?? "?"}. ${note}`
      : `Перемещение → ${toLoc?.name ?? "?"}`;
    const toComment = note
      ? `Перемещение ← ${fromLoc?.name ?? "?"}. ${note}`
      : `Перемещение ← ${fromLoc?.name ?? "?"}`;

    await tx.insert(stockMovements).values([
      {
        type: "adjustment",
        materialId: input.materialId,
        storageLocationId: input.fromStorageLocationId,
        quantity: toDecimalString(-input.quantity),
        userId: input.userId,
        comment: fromComment,
        balanceAfter: fromBalance.quantity,
      },
      {
        type: "adjustment",
        materialId: input.materialId,
        storageLocationId: input.toStorageLocationId,
        quantity: qty,
        userId: input.userId,
        comment: toComment,
        balanceAfter: toBalance.quantity,
      },
    ]);
  });
}
