import { API_AUTH_LOGIN } from "../constants/apiConstants";
import { apiClient } from "../utils/apiClient";
import {
  loginResponseSchema,
  type LoginResponse,
} from "../validation/apiSchemas";

export interface LoginRequest {
  username: string;
  password: string;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    // Валидация входных данных
    if (!username || !username.trim()) {
      throw new Error("Имя пользователя не может быть пустым");
    }
    if (!password || !password.trim()) {
      throw new Error("Пароль не может быть пустым");
    }

    try {
      const requestBody = {
        username: username.trim(),
        password: password.trim(),
      } as LoginRequest;

      console.log("Отправка запроса на логин:", {
        username: requestBody.username,
        passwordLength: requestBody.password.length,
      });

      const response = await apiClient.post<unknown>(
        API_AUTH_LOGIN,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
          validateStatus: () => true,
        }
      );

      if (response.status === 401 || response.status === 403) {
        throw new Error("Неверный логин или пароль");
      }

      if (response.status >= 400) {
        const errorPayload = response.data as { message?: string } | null;
        const errorMessage = errorPayload?.message
          ? errorPayload.message
          : `Ошибка авторизации: ${response.status}`;
        throw new Error(errorMessage);
      }

      const rawData = response.data;
      const parsed = loginResponseSchema.safeParse(rawData);

      if (!parsed.success || !parsed.data.token.trim()) {
        throw new Error("Неверный логин или пароль");
      }

      return parsed.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Ошибка подключения к серверу");
    }
  },
};
