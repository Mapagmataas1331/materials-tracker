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
import { categoryFormSchema, type CategoryFormValues } from "@/lib/validators/references";
import { createCategoryAction } from "@/server/actions/references";

export function CreateCategoryDialog({
  onCreated,
}: {
  onCreated: (item: { id: string; name: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: "" },
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset({ name: "" });
  }

  async function onSubmit(values: CategoryFormValues) {
    const result = await createCategoryAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Категория создана");
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
          <DialogTitle>Новая категория</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="category-name">Название</FieldLabel>
              <Input id="category-name" autoFocus {...register("name")} />
              <FieldError errors={errors.name ? [errors.name] : undefined} />
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
