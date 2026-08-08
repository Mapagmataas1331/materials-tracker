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
import { materialFormSchema, type MaterialFormValues } from "@/lib/validators/materials";
import { createMaterialAction, updateMaterialAction } from "@/server/actions/materials";

interface Option {
  id: string;
  name: string;
}

export function MaterialForm({
  categories,
  units,
  material,
}: {
  categories: Option[];
  units: (Option & { shortName: string })[];
  material?: {
    id: string;
    name: string;
    categoryId: string;
    unitId: string;
    minStock: number;
    comment: string | null;
  };
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MaterialFormValues>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: material
      ? {
          name: material.name,
          categoryId: material.categoryId,
          unitId: material.unitId,
          minStock: material.minStock,
          comment: material.comment ?? "",
        }
      : { name: "", categoryId: "", unitId: "", minStock: 0, comment: "" },
  });

  async function onSubmit(values: MaterialFormValues) {
    if (material) {
      const result = await updateMaterialAction(material.id, values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Материал сохранён");
      router.push(`/materials/${material.id}`);
    } else {
      const result = await createMaterialAction(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Материал создан");
      router.push(`/materials/${result.data.id}`);
    }
    router.refresh();
  }

  const categoryId = watch("categoryId");
  const unitId = watch("unitId");

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-xl space-y-6">
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">Наименование</FieldLabel>
          <Input id="name" {...register("name")} />
          <FieldError errors={errors.name ? [errors.name] : undefined} />
        </Field>

        <Field data-invalid={!!errors.categoryId}>
          <FieldLabel>Категория</FieldLabel>
          <Select
            items={{
              "": "Выберите категорию",
              ...Object.fromEntries(categories.map((c) => [c.id, c.name])),
            }}
            value={categoryId}
            onValueChange={(v) => setValue("categoryId", v ?? "", { shouldValidate: true })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={errors.categoryId ? [errors.categoryId] : undefined} />
        </Field>

        <Field data-invalid={!!errors.unitId}>
          <FieldLabel>Единица измерения</FieldLabel>
          <Select
            items={{
              "": "Выберите единицу измерения",
              ...Object.fromEntries(units.map((u) => [u.id, `${u.name} (${u.shortName})`])),
            }}
            value={unitId}
            onValueChange={(v) => setValue("unitId", v ?? "", { shouldValidate: true })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name} ({u.shortName})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={errors.unitId ? [errors.unitId] : undefined} />
        </Field>

        <Field data-invalid={!!errors.minStock}>
          <FieldLabel htmlFor="minStock">Минимальный остаток</FieldLabel>
          <Input
            id="minStock"
            type="number"
            step="0.001"
            min={0}
            {...register("minStock", { valueAsNumber: true })}
          />
          <FieldError errors={errors.minStock ? [errors.minStock] : undefined} />
        </Field>

        <Field data-invalid={!!errors.comment}>
          <FieldLabel htmlFor="comment">Комментарий</FieldLabel>
          <Textarea id="comment" rows={3} {...register("comment")} />
          <FieldError errors={errors.comment ? [errors.comment] : undefined} />
        </Field>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting && <Loader2 className="animate-spin" />}
            Сохранить
          </Button>
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.back()}>
            Отмена
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
