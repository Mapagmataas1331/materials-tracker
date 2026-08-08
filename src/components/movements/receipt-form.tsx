"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PackagePlus } from "lucide-react";
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
import { MaterialCombobox } from "@/components/materials/material-combobox";
import { receiptFormSchema, type ReceiptFormValues } from "@/lib/validators/movements";
import { createReceiptAction } from "@/server/actions/movements";

interface Option {
  id: string;
  name: string;
}

export function ReceiptForm({
  storageLocations,
  suppliers,
  onCreated,
}: {
  storageLocations: Option[];
  suppliers: Option[];
  onCreated?: () => void;
}) {
  const router = useRouter();
  const [selectedMaterial, setSelectedMaterial] = useState<{ id: string; name: string; unitShortName: string | null } | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: {
      materialId: "",
      quantity: undefined,
      unitCost: undefined,
      storageLocationId: "",
      supplierId: "",
      comment: "",
    },
  });

  async function onSubmit(values: ReceiptFormValues) {
    const result = await createReceiptAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success("Поступление оформлено");
    reset();
    setSelectedMaterial(null);
    router.refresh();
    onCreated?.();
  }

  const storageLocationId = watch("storageLocationId") ?? "";
  const supplierId = watch("supplierId") ?? "";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <FieldGroup>
        <Field data-invalid={!!errors.materialId}>
          <FieldLabel>Материал</FieldLabel>
          <MaterialCombobox
            value={selectedMaterial}
            onChange={(option) => {
              setSelectedMaterial(option);
              setValue("materialId", option?.id ?? "", { shouldValidate: true });
            }}
          />
          <FieldError errors={errors.materialId ? [errors.materialId] : undefined} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.quantity}>
            <FieldLabel htmlFor="quantity">
              Количество {selectedMaterial?.unitShortName ? `(${selectedMaterial.unitShortName})` : ""}
            </FieldLabel>
            <Input
              id="quantity"
              type="number"
              step="0.001"
              min={0}
              {...register("quantity", { valueAsNumber: true })}
            />
            <FieldError errors={errors.quantity ? [errors.quantity] : undefined} />
          </Field>

          <Field data-invalid={!!errors.unitCost}>
            <FieldLabel htmlFor="unitCost">Цена за единицу, ₽ (необязательно)</FieldLabel>
            <Input
              id="unitCost"
              type="number"
              step="0.01"
              min={0}
              {...register("unitCost", { valueAsNumber: true })}
            />
            <FieldError errors={errors.unitCost ? [errors.unitCost] : undefined} />
          </Field>
        </div>

        <Field data-invalid={!!errors.storageLocationId}>
          <FieldLabel>Место хранения</FieldLabel>
          <Select
            items={{
              "": "Выберите место хранения",
              ...Object.fromEntries(storageLocations.map((l) => [l.id, l.name])),
            }}
            value={storageLocationId}
            onValueChange={(v) => setValue("storageLocationId", v ?? "", { shouldValidate: true })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {storageLocations.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={errors.storageLocationId ? [errors.storageLocationId] : undefined} />
        </Field>

        <Field data-invalid={!!errors.supplierId}>
          <FieldLabel>Поставщик</FieldLabel>
          <Select
            items={{
              "": "Выберите поставщика",
              ...Object.fromEntries(suppliers.map((s) => [s.id, s.name])),
            }}
            value={supplierId}
            onValueChange={(v) => setValue("supplierId", v ?? "", { shouldValidate: true })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={errors.supplierId ? [errors.supplierId] : undefined} />
        </Field>

        <Field data-invalid={!!errors.comment}>
          <FieldLabel htmlFor="comment">Комментарий</FieldLabel>
          <Textarea id="comment" rows={2} {...register("comment")} />
          <FieldError errors={errors.comment ? [errors.comment] : undefined} />
        </Field>

        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? <Loader2 className="animate-spin" /> : <PackagePlus />}
          Оформить поступление
        </Button>
      </FieldGroup>
    </form>
  );
}
