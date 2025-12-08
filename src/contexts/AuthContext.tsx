import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { User } from "../types";
import { AuthContext, setAuthTokenGetter } from "./AuthContextInstance";
import { PageLoader } from "../components/ui/PageLoader";
import { authService } from "../services/authService";
import { userService } from "../services/userService";
import {
  extractRoleFromToken,
  extractUserIdFromToken,
  isTokenExpired,
  decodeJwt,
} from "../utils/jwtUtils";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const safeReadToken = useCallback(() => {
    if (typeof window === "undefined" || !window.localStorage) {
      return null;
    }
    return window.localStorage.getItem("authToken");
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = safeReadToken();
      setToken(storedToken);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      // Проверяем, не истек ли токен (только для реального API)
      if (isTokenExpired(storedToken)) {
        console.warn("Токен истек, требуется повторная авторизация");
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        setToken(null);
        setIsLoading(false);
        return;
      }

      // Извлекаем роль из токена
      const extractedRole = extractRoleFromToken(storedToken);
      localStorage.setItem("userRole", extractedRole);

      // Извлекаем ID пользователя из токена и загружаем профиль
      const userId = extractUserIdFromToken(storedToken);
      if (userId) {
        try {
          const userProfile = await userService.getUserProfile(userId);
          setUser(userProfile);
        } catch (error) {
          console.error("Ошибка загрузки профиля пользователя:", error);
          // Если не удалось загрузить профиль, очищаем токен
          localStorage.removeItem("authToken");
          localStorage.removeItem("userRole");
          setToken(null);
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, [safeReadToken]);

  const login = useCallback(async (username: string, password: string) => {
    try {
      // Выполняем запрос на логин через API
      const response = await authService.login(username, password);
      const { token } = response;

      // Сохраняем токен
      localStorage.setItem("authToken", token);
      setToken(token);

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
      setToken(null);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    setToken(null);
  }, []);

  const getToken = useCallback(
    () => token ?? safeReadToken(),
    [token, safeReadToken]
  );

  useEffect(() => {
    setAuthTokenGetter(getToken);
    return () => {
      setAuthTokenGetter(undefined);
    };
  }, [getToken]);

  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      login,
      logout,
      getToken,
    }),
    [user, isLoading, login, logout, getToken]
  );

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
