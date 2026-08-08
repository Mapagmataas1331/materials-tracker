import { z } from "zod";

const loginSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Минимум 3 символа")
  .max(50)
  .regex(/^[a-z0-9._-]+$/, "Только латинские буквы, цифры, точка, дефис и подчёркивание");

const passwordSchema = z
  .string()
  .min(8, "Минимум 8 символов")
  .max(200);

export const createUserFormSchema = z.object({
  fullName: z.string().trim().min(2, "Укажите ФИО").max(200),
  login: loginSchema,
  password: passwordSchema,
  role: z.enum(["admin", "user"]),
});

export type CreateUserFormValues = z.infer<typeof createUserFormSchema>;

export const changePasswordFormSchema = z.object({
  password: passwordSchema,
});

export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

export const changeOwnPasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Введите текущий пароль"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Повторите пароль"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  })
  .refine((v) => v.password !== v.currentPassword, {
    message: "Новый пароль должен отличаться от текущего",
    path: ["password"],
  });

export type ChangeOwnPasswordFormValues = z.infer<typeof changeOwnPasswordFormSchema>;

export const loginFormSchema = z.object({
  login: z.string().trim().min(1, "Введите логин"),
  password: z.string().min(1, "Введите пароль"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
