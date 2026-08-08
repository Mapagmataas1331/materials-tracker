"use server";

import { revalidatePath } from "next/cache";

import { writeAuditLog } from "@/lib/audit";
import { requireAdmin } from "@/lib/current-user";
import { changePasswordFormSchema, createUserFormSchema } from "@/lib/validators/users";
import * as usersService from "@/server/services/users";
import { toActionError } from "@/server/actions/to-action-error";
import type { ActionResult } from "@/server/actions/types";

export async function createUserAction(values: unknown): Promise<ActionResult<null>> {
  try {
    await requireAdmin();
    const parsed = createUserFormSchema.parse(values);
    await usersService.createUser(parsed);
    revalidatePath("/users");
    return { ok: true, data: null };
  } catch (error) {
    return toActionError(error, "Не удалось создать пользователя", {
      uniqueMessage: "Пользователь с таким логином уже существует",
    });
  }
}

export async function setUserActiveAction(id: string, isActive: boolean): Promise<ActionResult<null>> {
  try {
    const admin = await requireAdmin();
    if (admin.id === id && !isActive) {
      return { ok: false, error: "Нельзя отключить собственную учётную запись" };
    }
    if (!isActive && (await usersService.isLastActiveAdmin(id))) {
      return { ok: false, error: "Нельзя отключить последнего администратора" };
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
    const admin = await requireAdmin();
    const parsed = changePasswordFormSchema.parse(values);
    await usersService.changeUserPassword(id, parsed.password);
    await writeAuditLog({
      entityType: "user",
      entityId: id,
      userId: admin.id,
      action: "password_change",
    });
    revalidatePath("/users");
    return { ok: true, data: null };
  } catch (error) {
    return toActionError(error, "Не удалось изменить пароль");
  }
}

export async function updateUserRoleAction(id: string, role: "admin" | "user"): Promise<ActionResult<null>> {
  try {
    await requireAdmin();
    if (role === "user" && (await usersService.isLastActiveAdmin(id))) {
      return { ok: false, error: "Нельзя снять роль с последнего администратора" };
    }
    await usersService.updateUserRole(id, role);
    revalidatePath("/users");
    return { ok: true, data: null };
  } catch (error) {
    return toActionError(error, "Не удалось изменить роль");
  }
}
