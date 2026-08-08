"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/current-user";
import {
  categoryFormSchema,
  storageLocationFormSchema,
  supplierFormSchema,
  unitFormSchema,
} from "@/lib/validators/references";
import * as refs from "@/server/services/references";
import { toActionError } from "@/server/actions/to-action-error";
import type { ActionResult } from "@/server/actions/types";

function refError(error: unknown, fallback: string): ActionResult<never> {
  return toActionError(error, fallback, { uniqueMessage: "Такое название уже существует" });
}

/**
 * Thin adapters with a uniform {name, extra?} shape so the generic
 * <ReferenceSection> Client Component can receive them directly as props.
 * Server Actions can cross the server/client boundary as props only when
 * passed by reference (a "use server" function) — a plain arrow function
 * wrapping one (e.g. `(v) => createCategoryAction({ name: v.name })`)
 * is just a regular closure and Next.js rejects it at render time.
 */
export async function createCategoryRefAction(values: { name: string; extra?: string }): Promise<ActionResult<null>> {
  const result = await createCategoryAction({ name: values.name });
  if (!result.ok) return result;
  return { ok: true, data: null };
}

export async function createUnitRefAction(values: { name: string; extra?: string }): Promise<ActionResult<null>> {
  const result = await createUnitAction({ name: values.name, shortName: values.extra ?? "" });
  if (!result.ok) return result;
  return { ok: true, data: null };
}

export async function createSupplierRefAction(values: { name: string; extra?: string }): Promise<ActionResult<null>> {
  return createSupplierAction({ name: values.name, contactInfo: values.extra });
}

export async function createStorageLocationRefAction(values: { name: string; extra?: string }): Promise<ActionResult<null>> {
  return createStorageLocationAction({ name: values.name });
}

export async function updateCategoryRefAction(
  id: string,
  values: { name: string; extra?: string },
): Promise<ActionResult<null>> {
  return updateCategoryAction(id, { name: values.name });
}

export async function updateUnitRefAction(
  id: string,
  values: { name: string; extra?: string },
): Promise<ActionResult<null>> {
  return updateUnitAction(id, { name: values.name, shortName: values.extra ?? "" });
}

export async function updateSupplierRefAction(
  id: string,
  values: { name: string; extra?: string },
): Promise<ActionResult<null>> {
  return updateSupplierAction(id, { name: values.name, contactInfo: values.extra });
}

export async function updateStorageLocationRefAction(
  id: string,
  values: { name: string; extra?: string },
): Promise<ActionResult<null>> {
  return updateStorageLocationAction(id, { name: values.name });
}

export async function createCategoryAction(
  values: unknown,
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    await requireAdmin();
    const parsed = categoryFormSchema.parse(values);
    const row = await refs.createCategory(parsed.name);
    revalidatePath("/settings");
    revalidatePath("/materials/new");
    return { ok: true, data: { id: row.id, name: row.name } };
  } catch (error) {
    return refError(error, "Не удалось создать категорию");
  }
}

export async function setCategoryArchivedAction(id: string, isArchived: boolean): Promise<ActionResult<null>> {
  try {
    await requireAdmin();
    await refs.setCategoryArchived(id, isArchived);
    revalidatePath("/settings");
    return { ok: true, data: null };
  } catch (error) {
    return refError(error, "Не удалось изменить категорию");
  }
}

export async function updateCategoryAction(id: string, values: unknown): Promise<ActionResult<null>> {
  try {
    await requireAdmin();
    const parsed = categoryFormSchema.parse(values);
    const row = await refs.updateCategory(id, parsed.name);
    if (!row) return { ok: false, error: "Категория не найдена" };
    revalidatePath("/settings");
    revalidatePath("/materials");
    return { ok: true, data: null };
  } catch (error) {
    return refError(error, "Не удалось сохранить категорию");
  }
}

export async function createUnitAction(
  values: unknown,
): Promise<ActionResult<{ id: string; name: string; shortName: string }>> {
  try {
    await requireAdmin();
    const parsed = unitFormSchema.parse(values);
    const row = await refs.createUnit(parsed.name, parsed.shortName);
    revalidatePath("/settings");
    revalidatePath("/materials/new");
    return { ok: true, data: { id: row.id, name: row.name, shortName: row.shortName } };
  } catch (error) {
    return refError(error, "Не удалось создать единицу измерения");
  }
}

export async function setUnitArchivedAction(id: string, isArchived: boolean): Promise<ActionResult<null>> {
  try {
    await requireAdmin();
    await refs.setUnitArchived(id, isArchived);
    revalidatePath("/settings");
    return { ok: true, data: null };
  } catch (error) {
    return refError(error, "Не удалось изменить единицу измерения");
  }
}

export async function updateUnitAction(id: string, values: unknown): Promise<ActionResult<null>> {
  try {
    await requireAdmin();
    const parsed = unitFormSchema.parse(values);
    const row = await refs.updateUnit(id, parsed.name, parsed.shortName);
    if (!row) return { ok: false, error: "Единица измерения не найдена" };
    revalidatePath("/settings");
    revalidatePath("/materials");
    return { ok: true, data: null };
  } catch (error) {
    return refError(error, "Не удалось сохранить единицу измерения");
  }
}

export async function createSupplierAction(values: unknown): Promise<ActionResult<null>> {
  try {
    await requireAdmin();
    const parsed = supplierFormSchema.parse(values);
    await refs.createSupplier(parsed.name, parsed.contactInfo);
    revalidatePath("/settings");
    return { ok: true, data: null };
  } catch (error) {
    return refError(error, "Не удалось создать поставщика");
  }
}

export async function setSupplierArchivedAction(id: string, isArchived: boolean): Promise<ActionResult<null>> {
  try {
    await requireAdmin();
    await refs.setSupplierArchived(id, isArchived);
    revalidatePath("/settings");
    return { ok: true, data: null };
  } catch (error) {
    return refError(error, "Не удалось изменить поставщика");
  }
}

export async function updateSupplierAction(id: string, values: unknown): Promise<ActionResult<null>> {
  try {
    await requireAdmin();
    const parsed = supplierFormSchema.parse(values);
    const row = await refs.updateSupplier(id, parsed.name, parsed.contactInfo);
    if (!row) return { ok: false, error: "Поставщик не найден" };
    revalidatePath("/settings");
    return { ok: true, data: null };
  } catch (error) {
    return refError(error, "Не удалось сохранить поставщика");
  }
}

export async function createStorageLocationAction(values: unknown): Promise<ActionResult<null>> {
  try {
    await requireAdmin();
    const parsed = storageLocationFormSchema.parse(values);
    await refs.createStorageLocation(parsed.name);
    revalidatePath("/settings");
    return { ok: true, data: null };
  } catch (error) {
    return refError(error, "Не удалось создать место хранения");
  }
}

export async function setStorageLocationArchivedAction(id: string, isArchived: boolean): Promise<ActionResult<null>> {
  try {
    await requireAdmin();
    await refs.setStorageLocationArchived(id, isArchived);
    revalidatePath("/settings");
    return { ok: true, data: null };
  } catch (error) {
    return refError(error, "Не удалось изменить место хранения");
  }
}

export async function updateStorageLocationAction(id: string, values: unknown): Promise<ActionResult<null>> {
  try {
    await requireAdmin();
    const parsed = storageLocationFormSchema.parse(values);
    const row = await refs.updateStorageLocation(id, parsed.name);
    if (!row) return { ok: false, error: "Место хранения не найдено" };
    revalidatePath("/settings");
    return { ok: true, data: null };
  } catch (error) {
    return refError(error, "Не удалось сохранить место хранения");
  }
}
