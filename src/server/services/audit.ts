import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { auditLog, users } from "@/db/schema";

export async function listAuditLog(limit = 100) {
  const rows = await db
    .select({
      id: auditLog.id,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      action: auditLog.action,
      changes: auditLog.changes,
      createdAt: auditLog.createdAt,
      userName: users.fullName,
      userLogin: users.login,
    })
    .from(auditLog)
    .innerJoin(users, eq(auditLog.userId, users.id))
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);

  return rows;
}
