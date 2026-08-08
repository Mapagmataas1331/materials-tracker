"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ActionResult } from "@/server/actions/types";

export interface ReferenceItem {
  id: string;
  name: string;
  isArchived: boolean;
  extra?: string | null;
}

export interface ExtraField {
  key: string;
  label: string;
  placeholder?: string;
}

export function ReferenceSection({
  title,
  description,
  items,
  extraField,
  onCreate,
  onToggleArchived,
}: {
  title: string;
  description?: string;
  items: ReferenceItem[];
  extraField?: ExtraField;
  onCreate: (values: { name: string; extra?: string }) => Promise<ActionResult<null>>;
  onToggleArchived: (id: string, isArchived: boolean) => Promise<ActionResult<null>>;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [extra, setExtra] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setIsCreating(true);
    const result = await onCreate({ name: name.trim(), extra: extra.trim() || undefined });
    setIsCreating(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success("Добавлено");
    setName("");
    setExtra("");
    router.refresh();
  }

  async function handleToggle(id: string, isArchived: boolean) {
    setPendingId(id);
    const result = await onToggleArchived(id, isArchived);
    setPendingId(null);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-medium">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      <form onSubmit={handleCreate} className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
        <Input
          placeholder="Название"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full sm:max-w-64"
        />
        {extraField && (
          <Input
            placeholder={extraField.placeholder ?? extraField.label}
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            className="w-full sm:max-w-48"
          />
        )}
        <Button type="submit" disabled={isCreating || !name.trim()} className="w-full sm:w-auto">
          {isCreating ? <Loader2 className="animate-spin" /> : <Plus />}
          Добавить
        </Button>
      </form>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              {extraField && <TableHead>{extraField.label}</TableHead>}
              <TableHead className="w-32" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={extraField ? 3 : 2} className="text-center text-sm text-muted-foreground">
                  Пока ничего не добавлено
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <TableRow key={item.id} className={item.isArchived ? "opacity-60" : undefined}>
                <TableCell className="font-medium">
                  {item.name}
                  {item.isArchived && (
                    <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      архив
                    </span>
                  )}
                </TableCell>
                {extraField && <TableCell>{item.extra ?? "—"}</TableCell>}
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="min-h-9"
                    disabled={pendingId === item.id}
                    onClick={() => handleToggle(item.id, !item.isArchived)}
                  >
                    {item.isArchived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
                    {item.isArchived ? "Вернуть" : "В архив"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
