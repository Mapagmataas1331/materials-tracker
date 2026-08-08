"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { transferFormSchema, type TransferFormValues } from "@/lib/validators/movements";
import { createTransferAction } from "@/server/actions/movements";

interface Option {
  id: string;
  name: string;
}

export function TransferForm({
  materialId,
  unitShortName,
  storageLocations,
  stockByLocation,
}: {
  materialId: string;
  unitShortName: string | null;
  storageLocations: Option[];
  stockByLocation: { storageLocationId: string; quantity: number }[];
}) {
  const router = useRouter();
  const fromOptions = storageLocations.filter((l) =>
    stockByLocation.some((s) => s.storageLocationId === l.id && s.quantity > 0),
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      materialId,
      fromStorageLocationId: "",
      toStorageLocationId: "",
      quantity: undefined,
      comment: "",
    },
  });

  const fromId = watch("fromStorageLocationId");
  const toId = watch("toStorageLocationId");
  const available = stockByLocation.find((s) => s.storageLocationId === fromId)?.quantity ?? 0;
  const toOptions = storageLocations.filter((l) => l.id !== fromId);

  async function onSubmit(values: TransferFormValues) {
    const result = await createTransferAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Перемещение выполнено");
    reset({
      materialId,
      fromStorageLocationId: "",
      toStorageLocationId: "",
      quantity: undefined,
      comment: "",
    });
    router.refresh();
  }

  if (fromOptions.length === 0 || storageLocations.length < 2) {
    return (
      <p className="text-sm text-muted-foreground">
        Для перемещения нужны остаток хотя бы в одном месте и минимум два места хранения.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FieldGroup>
        <Field data-invalid={!!errors.fromStorageLocationId}>
          <FieldLabel>Откуда</FieldLabel>
          <Select
            items={{
              "": "Выберите место",
              ...Object.fromEntries(fromOptions.map((l) => [l.id, l.name])),
            }}
            value={fromId}
            onValueChange={(v) => {
              setValue("fromStorageLocationId", v ?? "", { shouldValidate: true });
              if (toId === v) setValue("toStorageLocationId", "", { shouldValidate: true });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fromOptions.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError
            errors={errors.fromStorageLocationId ? [errors.fromStorageLocationId] : undefined}
          />
          {fromId && (
            <p className="text-xs text-muted-foreground">
              Доступно: {available} {unitShortName}
            </p>
          )}
        </Field>

        <Field data-invalid={!!errors.toStorageLocationId}>
          <FieldLabel>Куда</FieldLabel>
          <Select
            items={{
              "": "Выберите место",
              ...Object.fromEntries(toOptions.map((l) => [l.id, l.name])),
            }}
            value={toId}
            onValueChange={(v) => setValue("toStorageLocationId", v ?? "", { shouldValidate: true })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {toOptions.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError
            errors={errors.toStorageLocationId ? [errors.toStorageLocationId] : undefined}
          />
        </Field>

        <Field data-invalid={!!errors.quantity}>
          <FieldLabel htmlFor="transfer-quantity">Количество</FieldLabel>
          <Input
            id="transfer-quantity"
            type="number"
            step="0.001"
            min={0}
            {...register("quantity", { valueAsNumber: true })}
          />
          <FieldError errors={errors.quantity ? [errors.quantity] : undefined} />
        </Field>

        <Field data-invalid={!!errors.comment}>
          <FieldLabel htmlFor="transfer-comment">Комментарий</FieldLabel>
          <Textarea id="transfer-comment" rows={2} {...register("comment")} />
          <FieldError errors={errors.comment ? [errors.comment] : undefined} />
        </Field>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="animate-spin" />}
          Переместить
        </Button>
      </FieldGroup>
    </form>
  );
}
