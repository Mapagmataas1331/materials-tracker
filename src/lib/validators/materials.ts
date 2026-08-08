import { z } from "zod";

export const materialFormSchema = z.object({
  name: z.string().trim().min(2, "Минимум 2 символа").max(200),
  categoryId: z.string().uuid("Выберите категорию"),
  unitId: z.string().uuid("Выберите единицу измерения"),
  minStock: z.number().min(0, "Не может быть отрицательным").max(1_000_000_000),
  comment: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type MaterialFormValues = z.infer<typeof materialFormSchema>;
