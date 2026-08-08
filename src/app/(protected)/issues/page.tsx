import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IssueForm } from "@/components/movements/issue-form";
import { RecentMovementsTable } from "@/components/movements/recent-movements-table";
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
        <h1 className="text-xl font-semibold">Списание материалов</h1>
        <p className="text-sm text-muted-foreground">
          Списать материал со склада. Система не позволит списать больше, чем есть в наличии.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Новое списание</CardTitle>
          </CardHeader>
          <CardContent>
            <IssueForm storageLocations={storageLocations} />
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Последние списания</h2>
          <RecentMovementsTable rows={recent} showSupplier={false} />
        </div>
      </div>
    </div>
  );
}
