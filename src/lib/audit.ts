import { db } from "@/db";
import { auditLog } from "@/db/schema";

export async function writeAuditLog(input: {
  entityType: string;
  entityId: string;
  userId: string;
  action: string;
  changes?: Record<string, unknown> | null;
}) {
  await db.insert(auditLog).values({
    entityType: input.entityType,
    entityId: input.entityId,
    userId: input.userId,
    action: input.action,
    changes: input.changes ?? null,
  });
}
