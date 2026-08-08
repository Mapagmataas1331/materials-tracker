import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Roles are intentionally limited to two values per the specification
 * (section 2). Keep this list small and explicit rather than a generic
 * permissions table — the business does not need anything more granular
 * right now, and YAGNI keeps the auth logic auditable.
 */
export const userRoleEnum = pgEnum("user_role", ["admin", "user"]);

/**
 * `receipt` = поступление (приход), `issue` = списание (расход),
 * `adjustment` = корректировка остатка / ноги перемещения между местами
 * (ТЗ п.15).
 */
export const movementTypeEnum = pgEnum("movement_type", [
  "receipt",
  "issue",
  "adjustment",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  login: text("login").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("user"),
  isActive: boolean("is_active").notNull().default(true),
  /** Bumped on password change so existing JWTs are rejected in the session callback. */
  sessionVersion: integer("session_version").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  loginUnique: uniqueIndex("users_login_unique").on(table.login),
}));

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  nameUnique: uniqueIndex("categories_name_unique").on(table.name),
}));

export const units = pgTable("units", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  nameUnique: uniqueIndex("units_name_unique").on(table.name),
}));

export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  contactInfo: text("contact_info"),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  nameUnique: uniqueIndex("suppliers_name_unique").on(table.name),
}));

export const storageLocations = pgTable("storage_locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  nameUnique: uniqueIndex("storage_locations_name_unique").on(table.name),
}));

export const materials = pgTable("materials", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  categoryId: uuid("category_id").notNull().references(() => categories.id, { onDelete: "restrict" }),
  unitId: uuid("unit_id").notNull().references(() => units.id, { onDelete: "restrict" }),
  minStock: numeric("min_stock", { precision: 14, scale: 3 }).notNull().default("0"),
  comment: text("comment"),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Trigram GIN index for fast ILIKE '%...%' search/autocomplete
  // (ТЗ п.7, п.9) is created out-of-band by src/db/post-migrate.sql,
  // because drizzle-kit's index builder cannot express a custom
  // operator class (gin_trgm_ops) yet.
  categoryIdx: index("materials_category_idx").on(table.categoryId),
  nameUnique: uniqueIndex("materials_name_unique").on(table.name),
}));

/**
 * Per-location balance. This is the single source of truth for "how much
 * is where" (ТЗ п.6). The total balance shown on a material card is always
 * `SUM(quantity)` across this table for that material — we deliberately do
 * NOT cache a denormalised total on `materials`, so there is exactly one
 * place a stock number can drift out of sync (nowhere).
 */
export const materialStock = pgTable("material_stock", {
  materialId: uuid("material_id").notNull().references(() => materials.id, { onDelete: "restrict" }),
  storageLocationId: uuid("storage_location_id").notNull().references(() => storageLocations.id, { onDelete: "restrict" }),
  quantity: numeric("quantity", { precision: 14, scale: 3 }).notNull().default("0"),
}, (table) => ({
  pk: uniqueIndex("material_stock_pk").on(table.materialId, table.storageLocationId),
  quantityNonNegative: check("material_stock_quantity_non_negative", sql`${table.quantity} >= 0`),
}));

/**
 * Append-only ledger. Every receipt/issue/adjustment is one row here and
 * rows are never updated or deleted — this table IS the "История операций"
 * required by ТЗ п.11, and it also doubles as the audit trail required by
 * п.13 (защита от случайного удаления данных: there is nothing to delete).
 */
export const stockMovements = pgTable("stock_movements", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: movementTypeEnum("type").notNull(),
  materialId: uuid("material_id").notNull().references(() => materials.id, { onDelete: "restrict" }),
  storageLocationId: uuid("storage_location_id").notNull().references(() => storageLocations.id, { onDelete: "restrict" }),
  quantity: numeric("quantity", { precision: 14, scale: 3 }).notNull(),
  unitCost: numeric("unit_cost", { precision: 14, scale: 2 }),
  supplierId: uuid("supplier_id").references(() => suppliers.id, { onDelete: "restrict" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  comment: text("comment"),
  balanceAfter: numeric("balance_after", { precision: 14, scale: 3 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  materialIdx: index("stock_movements_material_idx").on(table.materialId, table.createdAt),
  createdAtIdx: index("stock_movements_created_at_idx").on(table.createdAt),
}));

/**
 * Generic change log for reference/master data edits (ТЗ п.15, "журнал
 * изменений карточек"). Kept generic (entity + entityId + jsonb diff) so it
 * does not need a new table every time another entity gains history.
 */
export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  action: text("action").notNull(),
  changes: jsonb("changes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  entityIdx: index("audit_log_entity_idx").on(table.entityType, table.entityId),
}));

export const materialsRelations = relations(materials, ({ one, many }) => ({
  category: one(categories, { fields: [materials.categoryId], references: [categories.id] }),
  unit: one(units, { fields: [materials.unitId], references: [units.id] }),
  stock: many(materialStock),
  movements: many(stockMovements),
}));

export const materialStockRelations = relations(materialStock, ({ one }) => ({
  material: one(materials, { fields: [materialStock.materialId], references: [materials.id] }),
  storageLocation: one(storageLocations, { fields: [materialStock.storageLocationId], references: [storageLocations.id] }),
}));

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  material: one(materials, { fields: [stockMovements.materialId], references: [materials.id] }),
  storageLocation: one(storageLocations, { fields: [stockMovements.storageLocationId], references: [storageLocations.id] }),
  supplier: one(suppliers, { fields: [stockMovements.supplierId], references: [suppliers.id] }),
  user: one(users, { fields: [stockMovements.userId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Unit = typeof units.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
export type StorageLocation = typeof storageLocations.$inferSelect;
export type Material = typeof materials.$inferSelect;
export type MaterialStock = typeof materialStock.$inferSelect;
export type StockMovement = typeof stockMovements.$inferSelect;
export type AuditLogEntry = typeof auditLog.$inferSelect;
