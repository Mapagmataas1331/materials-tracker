"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChangePasswordDialog } from "@/components/users/change-password-dialog";
import { setUserActiveAction, updateUserRoleAction } from "@/server/actions/users";
import type { SafeUser } from "@/server/services/users";

const ROLE_ITEMS = {
  user: "Пользователь",
  admin: "Администратор",
} as const;

export function UsersTable({ users, currentUserId }: { users: SafeUser[]; currentUserId: string }) {
  const router = useRouter();

  async function handleToggleActive(id: string, next: boolean) {
    const result = await setUserActiveAction(id, next);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(next ? "Пользователь включён" : "Пользователь отключён");
    router.refresh();
  }

  async function handleRoleChange(id: string, role: "admin" | "user") {
    const result = await updateUserRoleAction(id, role);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Роль изменена");
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ФИО</TableHead>
            <TableHead className="hidden sm:table-cell">Логин</TableHead>
            <TableHead>Роль</TableHead>
            <TableHead>Активен</TableHead>
            <TableHead className="w-auto sm:w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="max-w-[8rem] font-medium whitespace-normal sm:max-w-none">
                <div>{user.fullName}</div>
                <div className="text-xs text-muted-foreground sm:hidden">{user.login}</div>
              </TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">{user.login}</TableCell>
              <TableCell>
                <Select
                  items={ROLE_ITEMS}
                  value={user.role}
                  onValueChange={(v) => handleRoleChange(user.id, v as "admin" | "user")}
                >
                  <SelectTrigger className="w-full min-w-28 sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Пользователь</SelectItem>
                    <SelectItem value="admin">Администратор</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Switch
                  checked={user.isActive}
                  disabled={user.id === currentUserId}
                  onCheckedChange={(checked) => handleToggleActive(user.id, checked)}
                />
              </TableCell>
              <TableCell>
                <ChangePasswordDialog userId={user.id} userName={user.fullName} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
