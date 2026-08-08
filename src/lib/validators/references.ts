import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, "Минимум 2 символа").max(150),
});

export const unitFormSchema = z.object({
  name: z.string().trim().min(1, "Укажите название").max(150),
  shortName: z.string().trim().min(1, "Укажите сокращение").max(20),
});

export const supplierFormSchema = z.object({
  name: z.string().trim().min(2, "Минимум 2 символа").max(200),
  contactInfo: z.string().trim().max(500).optional().or(z.literal("")),
});

export const storageLocationFormSchema = z.object({
  name: z.string().trim().min(2, "Минимум 2 символа").max(150),
});
