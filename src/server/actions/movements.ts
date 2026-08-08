"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin, requireUser } from "@/lib/current-user";
import {
  adjustmentFormSchema,
  issueFormSchema,
  receiptFormSchema,
  transferFormSchema,
} from "@/lib/validators/movements";
import {
  createAdjustment,
  createIssue,
  createReceipt,
  createTransfer,
} from "@/server/services/movements";
import { toActionError } from "@/server/actions/to-action-error";
import type { ActionResult } from "@/server/actions/types";

function revalidateMaterialPaths(materialId: string) {
  revalidatePath("/materials");
  revalidatePath("/purchase-list");
  revalidatePath("/receipts");
  revalidatePath("/issues");
  revalidatePath(`/materials/${materialId}`);
}

export async function createReceiptAction(values: unknown): Promise<ActionResult<null>> {
  try {
    const user = await requireUser();
    const parsed = receiptFormSchema.parse(values);
    await createReceipt({ ...parsed, userId: user.id });
    revalidateMaterialPaths(parsed.materialId);
    return { ok: true, data: null };
  } catch (error) {
    return toActionError(error, "Не удалось оформить поступление");
  }
}

export async function createIssueAction(values: unknown): Promise<ActionResult<null>> {
  try {
    const user = await requireUser();
    const parsed = issueFormSchema.parse(values);
    await createIssue({ ...parsed, userId: user.id });
    revalidateMaterialPaths(parsed.materialId);
    return { ok: true, data: null };
  } catch (error) {
    return toActionError(error, "Не удалось оформить списание");
  }
}

export async function createAdjustmentAction(values: unknown): Promise<ActionResult<null>> {
  try {
    const user = await requireAdmin();
    const parsed = adjustmentFormSchema.parse(values);
    await createAdjustment({ ...parsed, userId: user.id });
    revalidateMaterialPaths(parsed.materialId);
    return { ok: true, data: null };
  } catch (error) {
    return toActionError(error, "Не удалось выполнить корректировку");
  }
}

export async function createTransferAction(values: unknown): Promise<ActionResult<null>> {
  try {
    const user = await requireAdmin();
    const parsed = transferFormSchema.parse(values);
    await createTransfer({ ...parsed, userId: user.id });
    revalidateMaterialPaths(parsed.materialId);
    return { ok: true, data: null };
  } catch (error) {
    return toActionError(error, "Не удалось выполнить перемещение");
  }
}
