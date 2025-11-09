/**
 * Создает fetch запрос с автоматическим добавлением токена авторизации
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem("authToken");

  const headers = new Headers(options.headers || {});

  // Добавляем токен в заголовки, если он есть
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Устанавливаем Content-Type по умолчанию, если не указан
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
