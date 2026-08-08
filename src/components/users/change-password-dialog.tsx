"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2 } from "lucide-react";
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
import { changePasswordFormSchema, type ChangePasswordFormValues } from "@/lib/validators/users";
import { changeUserPasswordAction } from "@/server/actions/users";
import { cn } from "@/lib/utils";

export function ChangePasswordDialog({ userId, userName }: { userId: string; userName: string }) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({ resolver: zodResolver(changePasswordFormSchema) });

  async function onSubmit(values: ChangePasswordFormValues) {
    const result = await changeUserPasswordAction(userId, values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Пароль изменён");
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        title="Сменить пароль"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "gap-1.5 px-2 sm:size-8 sm:px-0"
        )}
      >
        <KeyRound className="size-4" />
        <span className="sm:hidden">Пароль</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Смена пароля — {userName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="new-password">Новый пароль</FieldLabel>
              <Input id="new-password" type="text" autoComplete="off" {...register("password")} />
              <FieldError errors={errors.password ? [errors.password] : undefined} />
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Сохранить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
