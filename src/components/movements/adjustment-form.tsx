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
import { adjustmentFormSchema, type AdjustmentFormValues } from "@/lib/validators/movements";
import { createAdjustmentAction } from "@/server/actions/movements";

interface Option {
  id: string;
  name: string;
}

export function AdjustmentForm({
  materialId,
  unitShortName,
  storageLocations,
  currentByLocation,
}: {
  materialId: string;
  unitShortName: string | null;
  storageLocations: Option[];
  currentByLocation: { storageLocationId: string; quantity: number }[];
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdjustmentFormValues>({
    resolver: zodResolver(adjustmentFormSchema),
    defaultValues: {
      materialId,
      storageLocationId: "",
      newQuantity: 0,
      comment: "",
    },
  });

  const storageLocationId = watch("storageLocationId");
  const current =
    currentByLocation.find((r) => r.storageLocationId === storageLocationId)?.quantity ?? 0;

  async function onSubmit(values: AdjustmentFormValues) {
    const result = await createAdjustmentAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Корректировка выполнена");
    reset({ materialId, storageLocationId: "", newQuantity: 0, comment: "" });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FieldGroup>
        <Field data-invalid={!!errors.storageLocationId}>
          <FieldLabel>Место хранения</FieldLabel>
          <Select
            items={{
              "": "Выберите место",
              ...Object.fromEntries(storageLocations.map((l) => [l.id, l.name])),
            }}
            value={storageLocationId}
            onValueChange={(v) => {
              const id = v ?? "";
              setValue("storageLocationId", id, { shouldValidate: true });
              const qty =
                currentByLocation.find((r) => r.storageLocationId === id)?.quantity ?? 0;
              setValue("newQuantity", qty);
            }}
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
          {storageLocationId && (
            <p className="text-xs text-muted-foreground">
              Сейчас: {current} {unitShortName}
            </p>
          )}
        </Field>

        <Field data-invalid={!!errors.newQuantity}>
          <FieldLabel htmlFor="newQuantity">Новый остаток</FieldLabel>
          <Input
            id="newQuantity"
            type="number"
            step="0.001"
            min={0}
            {...register("newQuantity", { valueAsNumber: true })}
          />
          <FieldError errors={errors.newQuantity ? [errors.newQuantity] : undefined} />
        </Field>

        <Field data-invalid={!!errors.comment}>
          <FieldLabel htmlFor="adjustment-comment">Причина</FieldLabel>
          <Textarea id="adjustment-comment" rows={2} {...register("comment")} />
          <FieldError errors={errors.comment ? [errors.comment] : undefined} />
        </Field>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="animate-spin" />}
          Скорректировать
        </Button>
      </FieldGroup>
    </form>
  );
}
