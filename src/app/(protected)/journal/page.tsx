import { Suspense } from "react";

import { JournalFilterBar } from "@/components/movements/journal-filter-bar";
import { JournalPagination } from "@/components/movements/journal-pagination";
import { JournalTable } from "@/components/movements/journal-table";
import { requireUser } from "@/lib/current-user";
import {
  listJournalMovements,
  type JournalMovementType,
} from "@/server/services/movements";
import { listStorageLocations } from "@/server/services/references";
import { listUsers } from "@/server/services/users";

const PAGE_SIZE = 50;
const MOVEMENT_TYPES = new Set<JournalMovementType>(["receipt", "issue", "adjustment"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function asUuid(value?: string) {
  return value && UUID_RE.test(value) ? value : undefined;
}

function asDate(value?: string) {
  return value && DATE_RE.test(value) ? value : undefined;
}

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    type?: string;
    location?: string;
    user?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}) {
  await requireUser();
  const params = await searchParams;
  const requestedPage = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const type =
    params.type && MOVEMENT_TYPES.has(params.type as JournalMovementType)
      ? (params.type as JournalMovementType)
      : undefined;

  const filters = {
    type,
    userId: asUuid(params.user),
    storageLocationId: asUuid(params.location),
    materialQuery: params.q,
    dateFrom: asDate(params.from),
    dateTo: asDate(params.to),
  };

  const [firstPage, storageLocations, users] = await Promise.all([
    listJournalMovements({
      ...filters,
      limit: PAGE_SIZE,
      offset: (requestedPage - 1) * PAGE_SIZE,
    }),
    listStorageLocations(true),
    listUsers(),
  ]);

  const totalPages = Math.max(1, Math.ceil(firstPage.total / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const { rows, total } =
    page === requestedPage
      ? firstPage
      : await listJournalMovements({
          ...filters,
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
        });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold break-words">Журнал операций</h1>
        <p className="text-sm text-muted-foreground">
          Все поступления, списания и корректировки. Найдено: {total}
        </p>
      </div>

      <Suspense fallback={null}>
        <JournalFilterBar
          storageLocations={storageLocations.map((l) => ({ id: l.id, name: l.name }))}
          users={users.map((u) => ({ id: u.id, name: u.fullName }))}
        />
      </Suspense>

      <JournalTable rows={rows} />

      <Suspense fallback={null}>
        <JournalPagination page={page} pageSize={PAGE_SIZE} total={total} />
      </Suspense>
    </div>
  );
}
