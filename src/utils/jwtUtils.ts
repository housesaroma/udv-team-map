export interface JwtPayload {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"?: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
  FullName?: string;
  Email?: string;
  IsHr?: string;
  exp?: number;
  iss?: string;
  aud?: string;
}

export type UserRole = "employee" | "hr" | "admin";

/**
 * Декодирует JWT токен и извлекает payload
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded) as JwtPayload;
  } catch (error) {
    console.error("Ошибка декодирования JWT:", error);
    return null;
  }
}

/**
 * Извлекает роль пользователя из JWT токена
 */
export function extractRoleFromToken(token: string): UserRole {
  const payload = decodeJwt(token);
  if (!payload) {
    return "employee";
  }

  const role =
    payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  const isHrValue = payload.IsHr;
  const isHr =
    isHrValue === "true" ||
    isHrValue === "True" ||
    (typeof isHrValue === "boolean" && isHrValue === true);

  // Нормализуем роль к нижнему регистру для сравнения
  const normalizedRole = role?.toLowerCase();

  // Определяем роль на основе данных из токена
  if (normalizedRole === "admin") {
    return "admin";
  }
  if (normalizedRole === "hr" || isHr) {
    return "hr";
  }

  return "employee";
}

/**
 * Извлекает имя пользователя из JWT токена
 */
export function extractUsernameFromToken(token: string): string | null {
  const payload = decodeJwt(token);
  return (
    payload?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
    null
  );
}

/**
 * Извлекает email пользователя из JWT токена
 */
export function extractEmailFromToken(token: string): string | null {
  const payload = decodeJwt(token);
  return payload?.Email || null;
}

/**
 * Извлекает ID пользователя из JWT токена
 */
export function extractUserIdFromToken(token: string): string | null {
  const payload = decodeJwt(token);
  return (
    payload?.[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ] || null
  );
}

/**
 * Извлекает полное имя пользователя из JWT токена
 */
export function extractFullNameFromToken(token: string): string | null {
  const payload = decodeJwt(token);
  return payload?.FullName || null;
}

/**
 * Проверяет, не истек ли токен
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const expirationTime = payload.exp * 1000; // exp в секундах, конвертируем в миллисекунды
  return Date.now() >= expirationTime;
}
