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

      const response = await fetch(API_AUTH_LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Проверяем статус ответа
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Неверный логин или пароль");
        }
        // Пытаемся получить сообщение об ошибке от сервера
        let errorMessage = `Ошибка авторизации: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Если не удалось распарсить JSON, используем стандартное сообщение
        }
        throw new Error(errorMessage);
      }

      const data: LoginResponse = await response.json();

      // Проверяем, что токен действительно получен
      if (!data.token || !data.token.trim()) {
        throw new Error("Неверный логин или пароль");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Ошибка подключения к серверу");
    }
  },
};
