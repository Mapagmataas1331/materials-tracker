"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/current-user";
import { issueFormSchema, receiptFormSchema } from "@/lib/validators/movements";
import { createIssue, createReceipt, InsufficientStockError } from "@/server/services/movements";
import type { ActionResult } from "@/server/actions/types";

export async function createReceiptAction(values: unknown): Promise<ActionResult<null>> {
  try {
    const user = await requireUser();
    const parsed = receiptFormSchema.parse(values);
    await createReceipt({ ...parsed, userId: user.id });
    revalidatePath("/materials");
    revalidatePath("/purchase-list");
    revalidatePath(`/materials/${parsed.materialId}`);
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
    revalidatePath("/materials");
    revalidatePath("/purchase-list");
    revalidatePath(`/materials/${parsed.materialId}`);
    return { ok: true, data: null };
  } catch (error) {
    return toActionError(error, "Не удалось оформить списание");
  }
}

function toActionError(error: unknown, fallback: string): ActionResult<never> {
  if (error instanceof InsufficientStockError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof Error && error.name === "ForbiddenError") {
    return { ok: false, error: error.message };
  }
  console.error(fallback, error);
  return { ok: false, error: fallback };
}
