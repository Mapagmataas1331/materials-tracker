import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/password";

export type SafeUser = Omit<typeof users.$inferSelect, "passwordHash">;

function omitPasswordHash(user: typeof users.$inferSelect): SafeUser {
  const { passwordHash, ...safe } = user;
  return safe;
}

export async function findUserByLogin(login: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.login, login.trim().toLowerCase()))
    .limit(1);
  return user;
}

export async function findUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user;
}

/**
 * The single place that decides whether a login/password pair is valid.
 * Used by the Auth.js Credentials provider. Deliberately returns `null`
 * (never throws) for any failure so we never leak *why* a login failed
 * (unknown user vs. wrong password vs. disabled account look identical
 * to an attacker, per ТЗ п.13).
 */
export async function verifyCredentials(login: string, password: string): Promise<SafeUser | null> {
  const user = await findUserByLogin(login);
  if (!user || !user.isActive) return null;

  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) return null;

  return omitPasswordHash(user);
}

export async function listUsers() {
  const rows = await db.select().from(users).orderBy(users.fullName);
  return rows.map(omitPasswordHash);
}

export async function createUser(input: {
  fullName: string;
  login: string;
  password: string;
  role: "admin" | "user";
}) {
  const passwordHash = await hashPassword(input.password);
  const [created] = await db
    .insert(users)
    .values({
      fullName: input.fullName,
      login: input.login.trim().toLowerCase(),
      passwordHash,
      role: input.role,
    })
    .returning();
  return omitPasswordHash(created);
}

export async function setUserActive(id: string, isActive: boolean) {
  const [updated] = await db
    .update(users)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return updated ? omitPasswordHash(updated) : null;
}

export async function changeUserPassword(id: string, newPassword: string) {
  const passwordHash = await hashPassword(newPassword);
  const [updated] = await db
    .update(users)
    .set({
      passwordHash,
      sessionVersion: sql`${users.sessionVersion} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();
  return updated ? omitPasswordHash(updated) : null;
}

export class InvalidCurrentPasswordError extends Error {
  constructor() {
    super("Неверный текущий пароль");
    this.name = "InvalidCurrentPasswordError";
  }
}

export async function changeOwnPassword(
  id: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await findUserById(id);
  if (!user || !user.isActive) {
    throw new InvalidCurrentPasswordError();
  }
  const valid = await verifyPassword(user.passwordHash, currentPassword);
  if (!valid) {
    throw new InvalidCurrentPasswordError();
  }
  return changeUserPassword(id, newPassword);
}

export async function updateUserRole(id: string, role: "admin" | "user") {
  const [updated] = await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return updated ? omitPasswordHash(updated) : null;
}

/** True when `userId` is an active admin and there are no other active admins. */
export async function isLastActiveAdmin(userId: string): Promise<boolean> {
  const user = await findUserById(userId);
  if (!user || user.role !== "admin" || !user.isActive) return false;

  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(and(eq(users.role, "admin"), eq(users.isActive, true)));

  return Number(row?.count ?? 0) <= 1;
}
