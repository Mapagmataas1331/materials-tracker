import { CreateUserDialog } from "@/components/users/create-user-dialog";
import { UsersTable } from "@/components/users/users-table";
import { requireAdminPage } from "@/lib/current-user";
import { listUsers } from "@/server/services/users";

export default async function UsersPage() {
  const currentUser = await requireAdminPage();
  const users = await listUsers();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Пользователи</h1>
          <p className="text-sm text-muted-foreground">
            Учётные записи не удаляются — отключайте доступ переключателем «Активен», история операций сохранится.
          </p>
        </div>
        <CreateUserDialog />
      </div>
      <UsersTable users={users} currentUserId={currentUser.id} />
    </div>
  );
}
