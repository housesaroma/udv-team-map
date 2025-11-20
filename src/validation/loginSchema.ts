import { z } from "zod";

const passwordField = z
  .string()
  .min(1, "Введите пароль")
  .min(8, "Пароль должен содержать минимум 8 символов")
  .max(64, "Пароль не должен превышать 64 символов");

const loginSchemaWithEmail = z.object({
  username: z
    .string()
    .min(1, "Введите корпоративный email")
    .email("Введите корректный email"),
  password: passwordField,
});

const loginSchemaWithUsername = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Имя пользователя должно содержать минимум 3 символа"),
  password: passwordField,
});

export const createLoginSchema = (requireEmail: boolean) =>
  requireEmail ? loginSchemaWithEmail : loginSchemaWithUsername;

export type LoginFormValues = z.infer<typeof loginSchemaWithEmail>;
