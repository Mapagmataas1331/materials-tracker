import { unstable_rethrow } from "next/navigation";
import { ZodError } from "zod";

import type { ActionResult } from "@/server/actions/types";

type ToActionErrorOptions = {
  /** Friendly message for Postgres unique_violation (23505). */
  uniqueMessage?: string;
};

/**
 * Shared ActionResult mapper. Always rethrows Next.js control-flow errors
 * (redirect / notFound) so requireUser() can still send the client to login.
 */
export function toActionError(
  error: unknown,
  fallback: string,
  options: ToActionErrorOptions = {},
): ActionResult<never> {
  unstable_rethrow(error);

  if (error instanceof ZodError) {
    const first = error.issues[0]?.message;
    return { ok: false, error: first || fallback };
  }

  if (error instanceof Error && error.name === "ForbiddenError") {
    return { ok: false, error: error.message };
  }

  if (error instanceof Error && error.name === "InsufficientStockError") {
    return { ok: false, error: error.message };
  }

  if (error instanceof Error && error.name === "InactiveReferenceError") {
    return { ok: false, error: error.message };
  }

  if (
    options.uniqueMessage &&
    error instanceof Error &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  ) {
    return { ok: false, error: options.uniqueMessage };
  }

  console.error(fallback, error);
  return { ok: false, error: fallback };
}
