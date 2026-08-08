import { redirect } from "next/navigation";

import { auth } from "@/auth";

export class ForbiddenError extends Error {
  constructor(message = "Недостаточно прав для этого действия") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * The real authorization gate for every Server Component and Server
 * Action. Middleware only decides "is there a session at all"; this
 * function is what every page/mutation actually calls before touching
 * the database, so role checks can never be bypassed by hitting a
 * server action directly instead of going through the UI.
 */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session.user;
}

/**
 * Use inside Server Actions, where this function's own try/catch (or the
 * caller's) can turn the thrown error into a friendly ActionResult without
 * crossing a serialization boundary.
 */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new ForbiddenError();
  }
  return user;
}

/**
 * Use inside admin-only Server Component pages. Errors thrown from Server
 * Components get their message scrubbed by Next.js in production before
 * reaching a client error boundary, so page-level gating redirects instead
 * of throwing — this fails closed (no page content is ever rendered to a
 * non-admin) without depending on error-message serialization.
 */
export async function requireAdminPage() {
  const user = await requireUser();
  if (user.role !== "admin") {
    redirect("/materials");
  }
  return user;
}
