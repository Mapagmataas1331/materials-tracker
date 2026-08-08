"use client";

import { signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  changeOwnPasswordFormSchema,
  type ChangeOwnPasswordFormValues,
} from "@/lib/validators/users";
import { changeOwnPasswordAction } from "@/server/actions/users";

export function ChangeOwnPasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangeOwnPasswordFormValues>({
    resolver: zodResolver(changeOwnPasswordFormSchema),
    defaultValues: { currentPassword: "", password: "", confirmPassword: "" },
  });

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) reset();
  }

  async function onSubmit(values: ChangeOwnPasswordFormValues) {
    const result = await changeOwnPasswordAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Пароль изменён — войдите снова");
    handleOpenChange(false);
    await signOut({ callbackUrl: "/login?passwordChanged=1" });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Смена пароля</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.currentPassword}>
              <FieldLabel htmlFor="current-password">Текущий пароль</FieldLabel>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                {...register("currentPassword")}
              />
              <FieldError
                errors={errors.currentPassword ? [errors.currentPassword] : undefined}
              />
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="own-new-password">Новый пароль</FieldLabel>
              <Input
                id="own-new-password"
                type="password"
                autoComplete="new-password"
                {...register("password")}
              />
              <FieldError errors={errors.password ? [errors.password] : undefined} />
            </Field>
            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="confirm-password">Повтор пароля</FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              <FieldError
                errors={errors.confirmPassword ? [errors.confirmPassword] : undefined}
              />
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
