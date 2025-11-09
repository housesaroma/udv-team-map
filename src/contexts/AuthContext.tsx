import React, { useState, useEffect, useMemo } from "react";
import type { User } from "../types";
import { AuthContext } from "./AuthContextInstance";
import { PageLoader } from "../components/ui/PageLoader";
import { authService } from "../services/authService";
import { userService } from "../services/userService";
import {
  extractRoleFromToken,
  extractUserIdFromToken,
  isTokenExpired,
  decodeJwt,
} from "../utils/jwtUtils";
import { USE_MOCK_DATA } from "../constants/apiConstants";
import { MOCK_USERS } from "../constants/mockUsers";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("authToken");
      const userRole = localStorage.getItem("userRole") as
        | keyof typeof MOCK_USERS
        | null;

      if (!token) {
        setIsLoading(false);
        return;
      }

      // Если используем мок-данные, используем старую логику
      if (USE_MOCK_DATA) {
        if (userRole && MOCK_USERS[userRole]) {
          setUser(MOCK_USERS[userRole]);
        }
        setIsLoading(false);
        return;
      }

      // Проверяем, не истек ли токен (только для реального API)
      if (isTokenExpired(token)) {
        console.warn("Токен истек, требуется повторная авторизация");
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        setIsLoading(false);
        return;
      }

      // Извлекаем роль из токена
      const extractedRole = extractRoleFromToken(token);
      localStorage.setItem("userRole", extractedRole);

      // Извлекаем ID пользователя из токена и загружаем профиль
      const userId = extractUserIdFromToken(token);
      if (userId) {
        try {
          const userProfile = await userService.getUserProfile(userId);
          setUser(userProfile);
        } catch (error) {
          console.error("Ошибка загрузки профиля пользователя:", error);
          // Если не удалось загрузить профиль, очищаем токен
          localStorage.removeItem("authToken");
          localStorage.removeItem("userRole");
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // Если используем мок-данные, используем старую логику
      if (USE_MOCK_DATA) {
        if (password !== "password123") {
          throw new Error("Неверный пароль");
        }

        // Определяем роль по username/email (поддерживаем оба варианта)
        let userRole: keyof typeof MOCK_USERS = "employee";
        const loginValue = username.toLowerCase();

        if (loginValue.includes("admin")) {
          userRole = "admin";
        } else if (loginValue.includes("hr")) {
          userRole = "hr";
        }

        const mockUser = MOCK_USERS[userRole];
        if (!mockUser) {
          throw new Error("Пользователь не найден");
        }

        setUser(mockUser);
        localStorage.setItem("authToken", "mock-token");
        localStorage.setItem("userRole", userRole);
        return;
      }

      // Выполняем запрос на логин через API
      const response = await authService.login(username, password);
      const { token } = response;

      // Сохраняем токен
      localStorage.setItem("authToken", token);

      // Декодируем токен для диагностики
      const tokenPayload = decodeJwt(token);
      console.log("Полный payload токена:", tokenPayload);

      // Извлекаем роль из токена
      const userRole = extractRoleFromToken(token);
      console.log("Роль пользователя из токена:", userRole);
      localStorage.setItem("userRole", userRole);
      console.log("Сохраненная роль в localStorage:", userRole);

      // Извлекаем ID пользователя из токена и загружаем профиль
      const userId = extractUserIdFromToken(token);
      console.log("Извлеченный ID пользователя из токена:", userId);
      if (!userId) {
        throw new Error("Не удалось получить ID пользователя из токена");
      }

      // Загружаем профиль пользователя
      console.log("Загрузка профиля пользователя с ID:", userId);
      const userProfile = await userService.getUserProfile(userId);
      console.log("Профиль пользователя успешно загружен:", userProfile);
      setUser(userProfile);
    } catch (error) {
      console.error("Login error:", error);
      // Очищаем токен в случае ошибки
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
  };

  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      login,
      logout,
    }),
    [user, isLoading]
  );

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
