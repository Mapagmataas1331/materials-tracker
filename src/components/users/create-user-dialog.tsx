"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
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
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { createUserFormSchema, type CreateUserFormValues } from "@/lib/validators/users";
import { createUserAction } from "@/server/actions/users";

export function CreateUserDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: { fullName: "", login: "", password: "", role: "user" },
  });

  async function onSubmit(values: CreateUserFormValues) {
    const result = await createUserAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Пользователь создан");
    reset();
    setOpen(false);
    router.refresh();
  }

  const role = watch("role");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn(buttonVariants())}>
        <UserPlus />
        Новый пользователь
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новый пользователь</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.fullName}>
              <FieldLabel htmlFor="fullName">ФИО</FieldLabel>
              <Input id="fullName" {...register("fullName")} />
              <FieldError errors={errors.fullName ? [errors.fullName] : undefined} />
            </Field>
            <Field data-invalid={!!errors.login}>
              <FieldLabel htmlFor="login">Логин</FieldLabel>
              <Input id="login" autoComplete="off" {...register("login")} />
              <FieldError errors={errors.login ? [errors.login] : undefined} />
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Пароль</FieldLabel>
              <Input id="password" type="text" autoComplete="off" {...register("password")} />
              <FieldError errors={errors.password ? [errors.password] : undefined} />
            </Field>
            <Field data-invalid={!!errors.role}>
              <FieldLabel>Роль</FieldLabel>
              <Select
                items={{ user: "Пользователь", admin: "Администратор" }}
                value={role}
                onValueChange={(v) => setValue("role", v as "admin" | "user")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Пользователь</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={errors.role ? [errors.role] : undefined} />
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
