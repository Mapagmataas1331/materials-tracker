"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin, requireUser } from "@/lib/current-user";
import { materialFormSchema } from "@/lib/validators/materials";
import * as materialsService from "@/server/services/materials";
import { toActionError } from "@/server/actions/to-action-error";
import type { ActionResult } from "@/server/actions/types";

export async function createMaterialAction(values: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const parsed = materialFormSchema.parse(values);
    const material = await materialsService.createMaterial(parsed);
    revalidatePath("/materials");
    return { ok: true, data: { id: material.id } };
  } catch (error) {
    return toActionError(error, "Не удалось создать материал");
  }
}

export async function updateMaterialAction(id: string, values: unknown): Promise<ActionResult<null>> {
  try {
    await requireAdmin();
    const parsed = materialFormSchema.parse(values);
    await materialsService.updateMaterial(id, parsed);
    revalidatePath("/materials");
    revalidatePath(`/materials/${id}`);
    return { ok: true, data: null };
  } catch (error) {
    return toActionError(error, "Не удалось сохранить материал");
  }
}

export async function setMaterialArchivedAction(id: string, isArchived: boolean): Promise<ActionResult<null>> {
  try {
    await requireAdmin();
    await materialsService.setMaterialArchived(id, isArchived);
    revalidatePath("/materials");
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
