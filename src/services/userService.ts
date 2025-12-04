import { API_USER_BY_ID, USE_MOCK_DATA } from "../constants/apiConstants";
import { getDepartmentInfo } from "../utils/departmentUtils";
import type { ApiUserProfile, User } from "../types";
import { MOCK_USERS } from "../constants/mockUsers";
import { MOCK_USERS_RESPONSE } from "../constants/mockUsersProfile";
import { apiClient } from "../utils/apiClient";
import { extractFullNameFromToken } from "../utils/jwtUtils";
import { apiUserProfileSchema } from "../validation/apiSchemas";

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
      const response = await apiClient.get<unknown>(API_USER_BY_ID(userId), {
        validateStatus: () => true,
      });

      const { status, data: rawData } = response;
      const errorText =
        typeof rawData === "string"
          ? rawData
          : rawData
            ? JSON.stringify(rawData)
            : "";

      if (status === 401) {
        console.error("Ошибка авторизации при загрузке профиля (401)");
        throw new Error("Ошибка авторизации. Требуется повторный вход");
      }

      if (status === 404) {
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

      if (status === 400) {
        console.error("Ошибка 400 при загрузке профиля:", errorText);
        throw new Error("Неверный запрос");
      }

      if (status === 500) {
        console.warn("Ошибка сервера, пробуем загрузить из мок-данных...");
        const fallbackUser = this.getFallbackUser(userId);
        if (fallbackUser) {
          console.log("Пользователь найден в мок-данных:", userId);
          return fallbackUser;
        }
        throw new Error("Ошибка сервера");
      }

      if (status >= 400) {
        console.error(
          `Ошибка загрузки профиля: ${status}`,
          errorText || "Нет деталей ошибки"
        );
        console.warn(
          `Ошибка загрузки профиля: ${status}, пробуем мок-данные...`
        );
        const fallbackUser = this.getFallbackUser(userId);
        if (fallbackUser) {
          console.log("Пользователь найден в мок-данных:", userId);
          return fallbackUser;
        }
        throw new Error(`Ошибка загрузки профиля: ${status}`);
      }

      if (
        rawData === undefined ||
        rawData === null ||
        (typeof rawData === "string" && rawData.trim().length === 0)
      ) {
        console.warn("Пустой ответ от сервера, пробуем мок-данные...");
        const fallbackUser = this.getFallbackUser(userId);
        if (fallbackUser) {
          console.log("Пользователь найден в мок-данных:", userId);
          return fallbackUser;
        }
        throw new Error("Пустой ответ от сервера");
      }

      let apiData: unknown = rawData;
      if (typeof rawData === "string") {
        try {
          apiData = JSON.parse(rawData);
        } catch (parseError) {
          console.error("Ошибка парсинга JSON ответа:", parseError);
          console.error("Ответ сервера (текст):", rawData);
          throw new Error("Некорректный ответ от сервера");
        }
      }

      if (apiData) {
        console.log(
          "Полученные данные от API:",
          typeof apiData === "string"
            ? apiData
            : JSON.stringify(apiData, null, 2)
        );
      }

      // Проверяем, что данные в правильном формате
      if (!apiData || typeof apiData !== "object") {
        console.error("Ответ от API не является объектом:", apiData);
        const fallbackUser = this.getFallbackUser(userId);
        if (fallbackUser) {
          console.log("Пользователь найден в мок-данных:", userId);
          return fallbackUser;
        }
        throw new Error(
          "Некорректные данные профиля: ответ не является объектом"
        );
      }

      // Нормализуем данные - проверяем разные варианты названий полей
      const data = apiData as Record<string, unknown>;
      const normalizedData = {
        userId: (data.userId || data.user_id || data.id || userId) as string,
        userName: (data.userName ||
          data.user_name ||
          data.name ||
          data.fullName ||
          "") as string,
        position: (data.position || "") as string,
        department: (data.department || "") as string,
        avatar: data.avatar as string | undefined,
        phoneNumber: (data.phoneNumber || data.phone_number || data.phone) as
          | string
          | undefined,
        city: data.city as string | undefined,
        interests: data.interests as string | undefined,
        bornDate: (data.bornDate ||
          data.born_date ||
          data.birthDate ||
          data.birth_date) as string | undefined,
        workExperience: (data.workExperience ||
          data.work_experience ||
          data.hireDate ||
          data.hire_date) as string | undefined,
        contacts: data.contacts as
          | { telegram?: string[]; skype?: string[] }
          | undefined,
      };

      console.log("Нормализованные данные профиля:", normalizedData);

      // Если userName отсутствует, пытаемся использовать данные из токена
      if (!normalizedData.userName) {
        const token = localStorage.getItem("authToken");
        if (token) {
          const fullName = extractFullNameFromToken(token);
          if (fullName) {
            console.log(
              "Используем FullName из токена для userName:",
              fullName
            );
            normalizedData.userName = fullName;
          }
        }
      }

      const validationResult = apiUserProfileSchema.safeParse(normalizedData);

      if (!validationResult.success) {
        console.warn(
          "Некорректные данные профиля от сервера, пробуем мок-данные..."
        );
        console.warn("Ошибки валидации:", validationResult.error.flatten());
        console.warn("Нормализованные данные:", normalizedData);
        const fallbackUser = this.getFallbackUser(userId);
        if (fallbackUser) {
          console.log("Пользователь найден в мок-данных:", userId);
          return fallbackUser;
        }
        throw new Error("Некорректные данные профиля");
      }

      return transformApiUserToUser(validationResult.data);
    } catch (error) {
      // Перебрасываем наши кастомные ошибки, если пользователь не найден и в моках
      if (
        error instanceof Error &&
        (error.message.includes("не найден") ||
          error.message.includes("Неверный формат") ||
          error.message.includes("Ошибка авторизации"))
      ) {
        throw error;
      }

      // Для других ошибок пробуем найти пользователя в мок-данных
      console.warn("Ошибка при загрузке профиля, пробуем мок-данные...", error);
      console.warn("ID пользователя:", userId);
      if (error instanceof Error) {
        console.warn("Сообщение об ошибке:", error.message);
        console.warn("Стек ошибки:", error.stack);
      }
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

      // Более информативное сообщение об ошибке
      const errorMessage =
        error instanceof Error ? error.message : "Неизвестная ошибка";
      throw new Error(
        `Неизвестная ошибка при загрузке профиля: ${errorMessage}`
      );
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

// Метод для обновления профиля пользователя
export const updateUserProfile = async (
  userId: string,
  userData: Partial<User>
): Promise<User> => {
  if (USE_MOCK_DATA) {
    console.log("Обновление профиля отключено в режиме мок-данных");
    // Возвращаем обновленный mock-пользователь для симуляции
    const mockUser = userService.getFallbackUser(userId);
    if (mockUser) {
      return {
        ...mockUser,
        ...userData,
      };
    }
    throw new Error("Пользователь не найден в mock данных");
  }

  // Валидация UUID
  if (!userService.isValidUUID(userId)) {
    throw new Error("Неверный формат ID пользователя");
  }

  try {
    const requestBody = {
      phone: userData.phone,
      city: userData.city,
      interests: userData.interests,
      avatar: userData.avatar,
      contacts: userData.messengerLink
        ? { telegram: [userData.messengerLink] }
        : {},
      position: userData.position,
      department: userData.department?.name || userData.department || "",
    };

    const response = await apiClient.put<unknown>(
      API_USER_BY_ID(userId),
      requestBody,
      {
        validateStatus: () => true,
      }
    );

    const { status, data: rawData } = response;
    const errorText =
      typeof rawData === "string"
        ? rawData
        : rawData
          ? JSON.stringify(rawData)
          : "";

    if (status === 401) {
      console.error("Ошибка авторизации при обновлении профиля (401)");
      throw new Error("Ошибка авторизации. Требуется повторный вход");
    }

    if (status === 404) {
      throw new Error("Пользователь не найден");
    }

    if (status === 400) {
      console.error("Ошибка 400 при обновлении профиля:", errorText);
      throw new Error("Неверный запрос");
    }

    if (status >= 400) {
      console.error(
        `Ошибка обновления профиля: ${status}`,
        errorText || "Нет деталей ошибки"
      );
      throw new Error(`Ошибка обновления профиля: ${status}`);
    }

    if (
      rawData === undefined ||
      rawData === null ||
      (typeof rawData === "string" && rawData.trim().length === 0)
    ) {
      throw new Error("Пустой ответ от сервера");
    }

    let apiData: unknown = rawData;
    if (typeof rawData === "string") {
      try {
        apiData = JSON.parse(rawData);
      } catch (parseError) {
        console.error("Ошибка парсинга JSON ответа:", parseError);
        console.error("Ответ сервера (текст):", rawData);
        throw new Error("Некорректный ответ от сервера");
      }
    }

    console.log(
      "Полученные данные обновленного профиля от API:",
      typeof apiData === "string" ? apiData : JSON.stringify(apiData, null, 2)
    );

    // Проверяем, что данные в правильном формате
    if (!apiData || typeof apiData !== "object") {
      throw new Error(
        "Некорректные данные профиля: ответ не является объектом"
      );
    }

    // Нормализуем данные - проверяем разные варианты названий полей
    const data = apiData as Record<string, unknown>;
    const normalizedData = {
      userId: (data.userId || data.user_id || data.id || userId) as string,
      userName: (data.userName ||
        data.user_name ||
        data.name ||
        data.fullName ||
        "") as string,
      position: (data.position || "") as string,
      department: (data.department || "") as string,
      avatar: data.avatar as string | undefined,
      phoneNumber: (data.phoneNumber || data.phone_number || data.phone) as
        | string
        | undefined,
      city: data.city as string | undefined,
      interests: data.interests as string | undefined,
      bornDate: (data.bornDate ||
        data.born_date ||
        data.birthDate ||
        data.birth_date) as string | undefined,
      workExperience: (data.workExperience ||
        data.work_experience ||
        data.hireDate ||
        data.hire_date) as string | undefined,
      contacts: data.contacts as
        | { telegram?: string[]; skype?: string[] }
        | undefined,
    };

    console.log("Нормализованные данные обновленного профиля:", normalizedData);
    const validationResult = apiUserProfileSchema.safeParse(normalizedData);

    if (!validationResult.success) {
      console.error("Некорректные данные обновленного профиля:", {
        issues: validationResult.error.flatten(),
      });
      throw new Error("Некорректные данные обновленного профиля");
    }

    return transformApiUserToUser(validationResult.data);
  } catch (error) {
    // Более информативное сообщение об ошибке
    const errorMessage =
      error instanceof Error ? error.message : "Неизвестная ошибка";
    throw new Error(
      `Неизвестная ошибка при обновлении профиля: ${errorMessage}`
    );
  }
};
