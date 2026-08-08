"use server";

import { revalidatePath } from "next/cache";

import { writeAuditLog } from "@/lib/audit";
import { requireAdmin, requireUser } from "@/lib/current-user";
import { materialFormSchema } from "@/lib/validators/materials";
import * as materialsService from "@/server/services/materials";
import { toActionError } from "@/server/actions/to-action-error";
import type { ActionResult } from "@/server/actions/types";

export async function createMaterialAction(values: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const admin = await requireAdmin();
    const parsed = materialFormSchema.parse(values);
    const material = await materialsService.createMaterial(parsed);
    await writeAuditLog({
      entityType: "material",
      entityId: material.id,
      userId: admin.id,
      action: "create",
      changes: { name: material.name },
    });
    revalidatePath("/materials");
    revalidatePath("/purchase-list");
    return { ok: true, data: { id: material.id } };
  } catch (error) {
    return toActionError(error, "Не удалось создать материал", {
      uniqueMessage: "Материал с таким названием уже существует",
    });
  }
}

export async function updateMaterialAction(id: string, values: unknown): Promise<ActionResult<null>> {
  try {
    const admin = await requireAdmin();
    const parsed = materialFormSchema.parse(values);
    const material = await materialsService.updateMaterial(id, parsed);
    if (!material) return { ok: false, error: "Материал не найден" };
    await writeAuditLog({
      entityType: "material",
      entityId: id,
      userId: admin.id,
      action: "update",
      changes: parsed,
    });
    revalidatePath("/materials");
    revalidatePath("/purchase-list");
    revalidatePath(`/materials/${id}`);
    return { ok: true, data: null };
  } catch (error) {
    return toActionError(error, "Не удалось сохранить материал", {
      uniqueMessage: "Материал с таким названием уже существует",
    });
  }
}

export async function setMaterialArchivedAction(id: string, isArchived: boolean): Promise<ActionResult<null>> {
  try {
    const admin = await requireAdmin();
    const material = await materialsService.setMaterialArchived(id, isArchived);
    if (!material) return { ok: false, error: "Материал не найден" };
    await writeAuditLog({
      entityType: "material",
      entityId: id,
      userId: admin.id,
      action: isArchived ? "archive" : "restore",
    });
    revalidatePath("/materials");
    revalidatePath("/purchase-list");
    revalidatePath(`/materials/${id}`);
    return { ok: true, data: null };
  } catch (error) {
    return toActionError(error, "Не удалось изменить статус материала");
  }
}

export async function searchMaterialsAction(query: string) {
  await requireUser();
  return materialsService.searchMaterialsForAutocomplete(query);
}

export async function getStockAtLocationAction(materialId: string, storageLocationId: string) {
  await requireUser();
  return materialsService.getStockAtLocation(materialId, storageLocationId);
}
