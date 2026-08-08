"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { unitFormSchema, type UnitFormValues } from "@/lib/validators/references";
import { createUnitAction } from "@/server/actions/references";

export function CreateUnitDialog({
  onCreated,
}: {
  onCreated: (item: { id: string; name: string; shortName: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: { name: "", shortName: "" },
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset({ name: "", shortName: "" });
  }

  async function onSubmit(values: UnitFormValues) {
    const result = await createUnitAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Единица измерения создана");
    onCreated(result.data);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        type="button"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-auto px-2 py-1 text-xs")}
      >
        <Plus className="size-3.5" />
        Создать
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новая единица измерения</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="unit-name">Название</FieldLabel>
              <Input id="unit-name" autoFocus {...register("name")} />
              <FieldError errors={errors.name ? [errors.name] : undefined} />
            </Field>
            <Field data-invalid={!!errors.shortName}>
              <FieldLabel htmlFor="unit-shortName">Сокращение</FieldLabel>
              <Input id="unit-shortName" placeholder="шт, кг, м…" {...register("shortName")} />
              <FieldError errors={errors.shortName ? [errors.shortName] : undefined} />
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Создать
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
