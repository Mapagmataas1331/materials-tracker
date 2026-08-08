"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { setMaterialArchivedAction } from "@/server/actions/materials";
import { cn } from "@/lib/utils";

export function ArchiveMaterialButton({
  materialId,
  isArchived,
}: {
  materialId: string;
  isArchived: boolean;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleConfirm() {
    setIsPending(true);
    const result = await setMaterialArchivedAction(materialId, !isArchived);
    setIsPending(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(isArchived ? "Материал восстановлен из архива" : "Материал перемещён в архив");
    router.refresh();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}>
        {isArchived ? <ArchiveRestore /> : <Archive />}
        {isArchived ? "Восстановить" : "В архив"}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isArchived ? "Восстановить материал?" : "Переместить материал в архив?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isArchived
              ? "Материал снова появится в общем списке и будет доступен для поступлений и списаний."
              : "Материал будет скрыт из основного списка и поиска, но вся история операций сохранится. Материалы никогда не удаляются безвозвратно."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            Подтвердить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
