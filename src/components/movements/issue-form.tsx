"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PackageMinus } from "lucide-react";
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
import { formatQuantity } from "@/lib/format";
import { issueFormSchema, type IssueFormValues } from "@/lib/validators/movements";
import { getStockAtLocationAction } from "@/server/actions/materials";
import { createIssueAction } from "@/server/actions/movements";

interface Option {
  id: string;
  name: string;
}

export function IssueForm({
  storageLocations,
  onCreated,
}: {
  storageLocations: Option[];
  onCreated?: () => void;
}) {
  const router = useRouter();
  const [selectedMaterial, setSelectedMaterial] = useState<{ id: string; name: string; unitShortName: string | null } | null>(null);
  const [availableStock, setAvailableStock] = useState<number | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IssueFormValues>({
    resolver: zodResolver(issueFormSchema),
    defaultValues: {
      materialId: "",
      storageLocationId: "",
      quantity: undefined,
      comment: "",
    },
  });

  const materialId = watch("materialId") ?? "";
  const storageLocationId = watch("storageLocationId") ?? "";

  useEffect(() => {
    if (!materialId || !storageLocationId) {
      setAvailableStock(null);
      return;
    }
    let cancelled = false;
    getStockAtLocationAction(materialId, storageLocationId).then((qty) => {
      if (!cancelled) setAvailableStock(qty);
    });
    return () => {
      cancelled = true;
    };
  }, [materialId, storageLocationId]);

  async function onSubmit(values: IssueFormValues) {
    const result = await createIssueAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success("Списание оформлено");
    reset();
    setSelectedMaterial(null);
    setAvailableStock(null);
    router.refresh();
    onCreated?.();
  }

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

        {availableStock !== null && (
          <p className="text-sm text-muted-foreground">
            Доступно сейчас: <span className="font-medium text-foreground">{formatQuantity(availableStock)} {selectedMaterial?.unitShortName}</span>
          </p>
        )}

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

        <Field data-invalid={!!errors.comment}>
          <FieldLabel htmlFor="comment">Комментарий</FieldLabel>
          <Textarea id="comment" rows={2} {...register("comment")} />
          <FieldError errors={errors.comment ? [errors.comment] : undefined} />
        </Field>

        <Button type="submit" disabled={isSubmitting} variant="destructive" className="w-full sm:w-auto">
          {isSubmitting ? <Loader2 className="animate-spin" /> : <PackageMinus />}
          Оформить списание
        </Button>
      </FieldGroup>
    </form>
  );
}
