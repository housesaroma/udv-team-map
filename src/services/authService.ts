import { API_AUTH_LOGIN } from "../constants/apiConstants";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(API_AUTH_LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        } as LoginRequest),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Неверный логин или пароль");
        }
        throw new Error(`Ошибка авторизации: ${response.status}`);
      }

      const data: LoginResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Ошибка подключения к серверу");
    }
  },
};
