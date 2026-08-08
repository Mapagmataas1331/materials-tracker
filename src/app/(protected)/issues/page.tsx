import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IssueForm } from "@/components/movements/issue-form";
import { RecentMovementsTable } from "@/components/movements/recent-movements-table";
import { MissingRefsNotice } from "@/components/references/missing-refs-notice";
import { listRecentMovements } from "@/server/services/movements";
import { listStorageLocations } from "@/server/services/references";

export default async function IssuesPage() {
  const [storageLocations, recent] = await Promise.all([
    listStorageLocations(),
    listRecentMovements("issue"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold break-words">Списания</h1>
        <p className="text-sm text-muted-foreground">
          Списать материал со склада. Система не позволит списать больше, чем есть в наличии.
        </p>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Новое списание</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            {storageLocations.length > 0 ? (
              <IssueForm storageLocations={storageLocations} />
            ) : (
              <MissingRefsNotice
                title="Нет мест хранения"
                description="Добавьте хотя бы одно место хранения в настройках — затем можно оформить списание."
              />
            )}
          </CardContent>
        </Card>

        <div className="min-w-0">
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Последние списания</h2>
          <RecentMovementsTable rows={recent} showSupplier={false} />
        </div>
      </div>
    </div>
  );
}
