import { z } from "zod";

export const receiptFormSchema = z.object({
  materialId: z.string().uuid("Выберите материал"),
  storageLocationId: z.string().uuid("Выберите место хранения"),
  quantity: z.number().positive("Количество должно быть больше нуля").max(1_000_000_000),
  // Empty inputs often arrive as NaN from valueAsNumber; coerce away before validate.
  unitCost: z
    .union([z.number(), z.nan()])
    .optional()
    .transform((value) => (value === undefined || Number.isNaN(value) ? undefined : value))
    .pipe(z.number().min(0).max(1_000_000_000).optional()),
  supplierId: z.string().uuid("Выберите поставщика"),
  comment: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type ReceiptFormValues = z.infer<typeof receiptFormSchema>;

export const issueFormSchema = z.object({
  materialId: z.string().uuid("Выберите материал"),
  storageLocationId: z.string().uuid("Выберите место хранения"),
  quantity: z.number().positive("Количество должно быть больше нуля").max(1_000_000_000),
  comment: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type IssueFormValues = z.infer<typeof issueFormSchema>;

export const adjustmentFormSchema = z.object({
  materialId: z.string().uuid("Выберите материал"),
  storageLocationId: z.string().uuid("Выберите место хранения"),
  newQuantity: z.number().min(0, "Остаток не может быть отрицательным").max(1_000_000_000),
  comment: z.string().trim().min(2, "Укажите причину корректировки").max(2000),
});

export type AdjustmentFormValues = z.infer<typeof adjustmentFormSchema>;

export const transferFormSchema = z
  .object({
    materialId: z.string().uuid("Выберите материал"),
    fromStorageLocationId: z.string().uuid("Выберите место откуда"),
    toStorageLocationId: z.string().uuid("Выберите место куда"),
    quantity: z.number().positive("Количество должно быть больше нуля").max(1_000_000_000),
    comment: z.string().trim().max(2000).optional().or(z.literal("")),
  })
  .refine((v) => v.fromStorageLocationId !== v.toStorageLocationId, {
    message: "Места хранения должны отличаться",
    path: ["toStorageLocationId"],
  });

export type TransferFormValues = z.infer<typeof transferFormSchema>;
