import { z } from "zod";

export const updateUserRequestSchema = z.object({
  userId: z.string().min(1, "Не указан ID пользователя"),
  department: z
    .string()
    .trim()
    .min(1, "Укажите подразделение")
    .max(100, "Название подразделения слишком длинное"),
  position: z
    .string()
    .trim()
    .min(2, "Должность должна содержать минимум 2 символа")
    .max(120, "Название должности слишком длинное"),
});

export type UpdateUserRequestInput = z.infer<typeof updateUserRequestSchema>;
