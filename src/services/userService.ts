import { API_USERS, USE_MOCK_DATA } from "../constants/apiConstants";
import { getDepartmentInfo } from "../utils/departmentUtils";
import type { ApiUserProfile, User } from "../types";
import { MOCK_USERS } from "../constants/mockUsers";
import { MOCK_USERS_RESPONSE } from "../constants/mockUsersProfile";

export const userService = {
  async getUserProfile(userId: string): Promise<User> {
    // Если USE_MOCK_DATA = true, сразу используем мок-данные
    if (USE_MOCK_DATA) {
      console.log("Используем mock данные (USE_MOCK_DATA = true)");
      const mockUser = this.getFallbackUser(userId);
      if (mockUser) {
        return mockUser;
      }
      throw new Error("Пользователь не найден в mock данных");
    }

    // Сначала проверяем mock данные для текущего пользователя (для разработки)
    const mockUser = this.getMockUser(userId);
    if (mockUser) {
      console.log("Используем mock данные для пользователя:", userId);
      return mockUser;
    }

    // Валидация UUID
    if (!this.isValidUUID(userId)) {
      throw new Error("Неверный формат ID пользователя");
    }

    try {
      const response = await fetch(`${API_USERS}/${userId}`);

      // Проверка статуса ответа
      if (response.status === 404) {
        console.warn(
          "Пользователь не найден на сервере, пробуем загрузить из мок-данных..."
        );
        const fallbackUser = this.getFallbackUser(userId);
        if (fallbackUser) {
          console.log("Пользователь найден в мок-данных:", userId);
          return fallbackUser;
        }
        throw new Error("Пользователь не найден");
      }

      if (response.status === 400) {
        throw new Error("Неверный запрос");
      }

      if (response.status === 500) {
        console.warn("Ошибка сервера, пробуем загрузить из мок-данных...");
        const fallbackUser = this.getFallbackUser(userId);
        if (fallbackUser) {
          console.log("Пользователь найден в мок-данных:", userId);
          return fallbackUser;
        }
        throw new Error("Ошибка сервера");
      }

      if (!response.ok) {
        console.warn(
          `Ошибка загрузки профиля: ${response.status}, пробуем мок-данные...`
        );
        const fallbackUser = this.getFallbackUser(userId);
        if (fallbackUser) {
          console.log("Пользователь найден в мок-данных:", userId);
          return fallbackUser;
        }
        throw new Error(`Ошибка загрузки профиля: ${response.status}`);
      }

      // Проверяем, что ответ не пустой
      const responseText = await response.text();
      if (!responseText) {
        console.warn("Пустой ответ от сервера, пробуем мок-данные...");
        const fallbackUser = this.getFallbackUser(userId);
        if (fallbackUser) {
          console.log("Пользователь найден в мок-данных:", userId);
          return fallbackUser;
        }
        throw new Error("Пустой ответ от сервера");
      }

      const apiData: ApiUserProfile = JSON.parse(responseText);

      // Проверяем, что основные поля присутствуют - FIXED: user_id → userId
      if (!apiData.userId || !apiData.userName) {
        console.warn(
          "Некорректные данные профиля от сервера, пробуем мок-данные..."
        );
        const fallbackUser = this.getFallbackUser(userId);
        if (fallbackUser) {
          console.log("Пользователь найден в мок-данных:", userId);
          return fallbackUser;
        }
        throw new Error("Некорректные данные профиля");
      }

      return transformApiUserToUser(apiData);
    } catch (error) {
      // Перебрасываем наши кастомные ошибки, если пользователь не найден и в моках
      if (
        error instanceof Error &&
        (error.message.includes("не найден") ||
          error.message.includes("Неверный формат"))
      ) {
        throw error;
      }

      // Для других ошибок пробуем найти пользователя в мок-данных
      console.warn("Ошибка при загрузке профиля, пробуем мок-данные...", error);
      const fallbackUser = this.getFallbackUser(userId);
      if (fallbackUser) {
        console.log("Пользователь найден в мок-данных после ошибки:", userId);
        return fallbackUser;
      }

      // Обработка сетевых ошибок и ошибок JSON
      if (error instanceof SyntaxError) {
        throw new Error("Некорректный ответ от сервера");
      }

      if (error instanceof TypeError) {
        throw new Error("Проблема с подключением к серверу");
      }

      throw new Error("Неизвестная ошибка при загрузке профиля");
    }
  },

  isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  getMockUser(userId: string): User | null {
    // Ищем пользователя в mock данных по ID
    const mockUser = Object.values(MOCK_USERS).find(user => user.id === userId);
    return mockUser || null;
  },

  // Новый метод для поиска пользователя в мок-данных из MOCK_USERS_RESPONSE
  getFallbackUser(userId: string): User | null {
    // Сначала проверяем основные мок-данные
    const mockUser = this.getMockUser(userId);
    if (mockUser) {
      return mockUser;
    }

    // Затем проверяем мок-данные из админки - FIXED: added type annotation
    const adminMockUser = MOCK_USERS_RESPONSE.usersTable.find(
      (user: ApiUserProfile) => user.userId === userId // FIXED: user_id → userId
    );
    if (adminMockUser) {
      console.log("Пользователь найден в мок-данных админки:", userId);
      return transformApiUserToUser(adminMockUser);
    }

    return null;
  },

  // Метод для получения всех mock пользователей (может пригодиться)
  getMockUsers(): User[] {
    return Object.values(MOCK_USERS);
  },

  // Метод для получения всех пользователей из мок-данных админки
  getAdminMockUsers(): User[] {
    return MOCK_USERS_RESPONSE.usersTable.map(transformApiUserToUser);
  },

  // Метод для получения всех доступных пользователей (в зависимости от режима)
  getAllAvailableUsers(): User[] {
    if (USE_MOCK_DATA) {
      // Объединяем все мок-данные и убираем дубликаты по ID
      const allUsers = [...this.getMockUsers(), ...this.getAdminMockUsers()];
      const uniqueUsers = allUsers.filter(
        (user, index, array) => array.findIndex(u => u.id === user.id) === index
      );
      return uniqueUsers;
    }
    return this.getMockUsers(); // fallback
  },
};

const transformApiUserToUser = (apiUser: ApiUserProfile): User => {
  const nameParts = apiUser.userName.split(" ");

  // FIXED: Handle potentially undefined contacts
  const contacts = apiUser.contacts || {};
  const telegramContacts = contacts.telegram || [];

  return {
    id: apiUser.userId, // FIXED: user_id → userId
    firstName: nameParts[1] || "",
    lastName: nameParts[0] || "",
    middleName: nameParts[2] || "",
    position: apiUser.position,
    department: getDepartmentInfo(apiUser.department),
    avatar: apiUser.avatar,
    phone: apiUser.phoneNumber,
    city: apiUser.city,
    interests: apiUser.interests,
    birthDate: apiUser.bornDate,
    hireDate: apiUser.workExperience,
    messengerLink: telegramContacts[0] || "", // FIXED: safe access
  };
};
