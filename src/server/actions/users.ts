"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/current-user";
import { changePasswordFormSchema, createUserFormSchema } from "@/lib/validators/users";
import * as usersService from "@/server/services/users";
import type { ActionResult } from "@/server/actions/types";

function toActionError(error: unknown, fallback: string): ActionResult<never> {
  if (error instanceof Error && error.name === "ForbiddenError") {
    return { ok: false, error: error.message };
  }
  if (error instanceof Error && "code" in error && (error as { code?: string }).code === "23505") {
    return { ok: false, error: "Пользователь с таким логином уже существует" };
  }
  console.error(fallback, error);
  return { ok: false, error: fallback };
}

export async function createUserAction(values: unknown): Promise<ActionResult<null>> {
  try {
    await requireAdmin();
    const parsed = createUserFormSchema.parse(values);
    await usersService.createUser(parsed);
    revalidatePath("/users");
    return { ok: true, data: null };
  } catch (error) {
    return toActionError(error, "Не удалось создать пользователя");
  }
}

export async function setUserActiveAction(id: string, isActive: boolean): Promise<ActionResult<null>> {
  try {
    const admin = await requireAdmin();
    if (admin.id === id && !isActive) {
      return { ok: false, error: "Нельзя отключить собственную учётную запись" };
    }
    await usersService.setUserActive(id, isActive);
    revalidatePath("/users");
    return { ok: true, data: null };
  } catch (error) {
    return toActionError(error, "Не удалось изменить статус пользователя");
  }
}

export async function changeUserPasswordAction(id: string, values: unknown): Promise<ActionResult<null>> {
  try {
    await requireAdmin();
    const parsed = changePasswordFormSchema.parse(values);
    await usersService.changeUserPassword(id, parsed.password);
    revalidatePath("/users");
    return { ok: true, data: null };
  } catch (error) {
    return toActionError(error, "Не удалось изменить пароль");
  }
}

export async function updateUserRoleAction(id: string, role: "admin" | "user"): Promise<ActionResult<null>> {
  try {
    await requireAdmin();
    await usersService.updateUserRole(id, role);
    revalidatePath("/users");
    return { ok: true, data: null };
  } catch (error) {
    return toActionError(error, "Не удалось изменить роль");
  }
}
