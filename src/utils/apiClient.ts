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
    console.log("Добавлен токен в заголовок Authorization для запроса:", url);
  } else {
    console.warn("Токен не найден в localStorage для запроса:", url);
  }

  // Устанавливаем Content-Type по умолчанию, если не указан
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  console.log(`Ответ от ${url}:`, response.status, response.statusText);

  return response;
}
