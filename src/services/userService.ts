import { API_USER_BY_ID, API_USERS_MOVE } from "../constants/apiConstants";
import { getDepartmentInfo } from "../utils/departmentUtils";
import type { ApiUserProfile, User } from "../types";
import { MOCK_USERS } from "../constants/mockUsers";
import { MOCK_USERS_RESPONSE } from "../constants/mockUsersProfile";
import { apiClient } from "../utils/apiClient";
import { extractFullNameFromToken } from "../utils/jwtUtils";
import { apiUserProfileSchema } from "../validation/apiSchemas";

/**
 * Извлекает строковое значение из возможно вложенных массивов или строки
 * Обрабатывает случаи: "value", ["value"], [[["value"]]], [[[]]] и т.д.
 */
function extractStringFromNested(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    // Рекурсивно ищем первую непустую строку в массиве
    for (const item of value) {
      const result = extractStringFromNested(item);
      if (result) {
        return result;
      }
    }
    return "";
  }
  return "";
}

/**
 * Нормализует поле contacts из API, обрабатывая различные некорректные форматы
 */
function normalizeContacts(contacts: unknown):
  | {
      telegram?: string[];
      skype?: string[];
      linkedin?: string[];
      whatsapp?: string[];
      vk?: string[];
      mattermost?: string[];
    }
  | undefined {
  if (!contacts || typeof contacts !== "object") {
    return undefined;
  }

  const contactsObj = contacts as Record<string, unknown>;
  const result: {
    telegram?: string[];
    skype?: string[];
    linkedin?: string[];
    whatsapp?: string[];
    vk?: string[];
    mattermost?: string[];
  } = {};

  // Нормализуем telegram
  if (contactsObj.telegram !== undefined) {
    const telegramValue = extractStringFromNested(contactsObj.telegram);
    if (telegramValue) {
      result.telegram = [telegramValue];
    }
  }

  // Нормализуем skype
  if (contactsObj.skype !== undefined) {
    const skypeValue = extractStringFromNested(contactsObj.skype);
    if (skypeValue) {
      result.skype = [skypeValue];
    }
  }

  // Нормализуем linkedin
  if (contactsObj.linkedin !== undefined) {
    const linkedinValue = extractStringFromNested(contactsObj.linkedin);
    if (linkedinValue) {
      result.linkedin = [linkedinValue];
    }
  }

  // Нормализуем whatsapp
  if (contactsObj.whatsapp !== undefined) {
    const whatsappValue = extractStringFromNested(contactsObj.whatsapp);
    if (whatsappValue) {
      result.whatsapp = [whatsappValue];
    }
  }

  // Нормализуем vk
  if (contactsObj.vk !== undefined) {
    const vkValue = extractStringFromNested(contactsObj.vk);
    if (vkValue) {
      result.vk = [vkValue];
    }
  }

  // Нормализуем mattermost
  if (contactsObj.mattermost !== undefined) {
    const mattermostValue = extractStringFromNested(contactsObj.mattermost);
    if (mattermostValue) {
      result.mattermost = [mattermostValue];
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

export interface MoveUserPayload {
  userId: string;
  targetHierarchyId: number;
  swapWithUserId?: string;
  newManagerId?: string;
}

export const userService = {
  async getUserProfile(userId: string): Promise<User> {
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

    const tryLoadFallback = (): User | null => {
      const fallbackUser = this.getFallbackUser(userId);
      if (fallbackUser) {
        console.log("Пользователь найден в мок-данных:", userId);
        return fallbackUser;
      }
      return null;
    };

    const fallbackOrThrow = (message: string): User => {
      const fallbackUser = tryLoadFallback();
      if (fallbackUser) {
        return fallbackUser;
      }
      throw new Error(message);
    };

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
        return fallbackOrThrow("Пользователь не найден");
      }

      if (status === 400) {
        console.error("Ошибка 400 при загрузке профиля:", errorText);
        throw new Error("Неверный запрос");
      }

      if (status === 500) {
        console.warn("Ошибка сервера, пробуем загрузить из мок-данных...");
        return fallbackOrThrow("Ошибка сервера");
      }

      if (status >= 400) {
        console.error(
          `Ошибка загрузки профиля: ${status}`,
          errorText || "Нет деталей ошибки"
        );
        console.warn(
          `Ошибка загрузки профиля: ${status}, пробуем мок-данные...`
        );
        return fallbackOrThrow(`Ошибка загрузки профиля: ${status}`);
      }

      if (
        rawData === undefined ||
        rawData === null ||
        (typeof rawData === "string" && rawData.trim().length === 0)
      ) {
        console.warn("Пустой ответ от сервера, пробуем мок-данные...");
        return fallbackOrThrow("Пустой ответ от сервера");
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
        return fallbackOrThrow(
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
        contacts: normalizeContacts(data.contacts),
        managerId: (data.managerId || data.manager_id) as string | undefined,
        hierarchyId: (data.hierarchyId || data.hierarchy_id) as
          | number
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
        return fallbackOrThrow("Некорректные данные профиля");
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
      const fallbackUser = tryLoadFallback();
      if (fallbackUser) {
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

  // Метод для получения всех доступных пользователей (используется для отладки)
  getAllAvailableUsers(): User[] {
    const allUsers = [...this.getMockUsers(), ...this.getAdminMockUsers()];
    const uniqueUsers = allUsers.filter(
      (user, index, array) => array.findIndex(u => u.id === user.id) === index
    );
    return uniqueUsers;
  },

  async moveUser(payload: MoveUserPayload): Promise<void> {
    const { userId, targetHierarchyId, swapWithUserId, newManagerId } = payload;

    if (!this.isValidUUID(userId)) {
      throw new Error("Неверный формат ID пользователя");
    }

    if (
      typeof targetHierarchyId !== "number" ||
      Number.isNaN(targetHierarchyId)
    ) {
      throw new Error("Не указан targetHierarchyId для перемещения");
    }

    if (!Number.isInteger(targetHierarchyId)) {
      throw new Error("targetHierarchyId должен быть целым числом");
    }

    const hasSwapTarget = Boolean(swapWithUserId);
    const hasNewManager = Boolean(newManagerId);

    if (hasSwapTarget && hasNewManager) {
      throw new Error(
        "Нельзя одновременно указывать swapWithUserId и newManagerId"
      );
    }

    if (hasSwapTarget && !this.isValidUUID(swapWithUserId as string)) {
      throw new Error("Неверный формат swapWithUserId");
    }

    if (hasNewManager && !this.isValidUUID(newManagerId as string)) {
      throw new Error("Неверный формат newManagerId");
    }

    console.log("🔁 Перемещение сотрудника", {
      userId,
      targetHierarchyId,
      swapWithUserId,
      newManagerId,
    });

    const requestBody: Record<string, unknown> = {
      userId,
      targetHierarchyId,
    };

    if (hasSwapTarget) {
      requestBody.swapWithUserId = swapWithUserId;
    }

    if (hasNewManager) {
      requestBody.newManagerId = newManagerId;
    }

    try {
      const response = await apiClient.post(API_USERS_MOVE, requestBody, {
        validateStatus: () => true,
      });

      if (response.status >= 400) {
        const errorText =
          typeof response.data === "string"
            ? response.data
            : response.data && typeof response.data === "object"
              ? JSON.stringify(response.data)
              : "";

        throw new Error(
          errorText
            ? `Не удалось переместить сотрудника: ${errorText}`
            : `Не удалось переместить сотрудника: ${response.status}`
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Не удалось переместить сотрудника";
      console.error("Ошибка перемещения сотрудника", message, error);
      throw new Error(message);
    }
  },
};

const transformApiUserToUser = (apiUser: ApiUserProfile): User => {
  const nameParts = apiUser.userName.split(" ");

  // FIXED: Handle potentially undefined contacts
  const contacts = apiUser.contacts || {};
  const telegramContacts = contacts.telegram || [];
  const skypeContacts = contacts.skype || [];
  const linkedinContacts = contacts.linkedin || [];
  const whatsappContacts = contacts.whatsapp || [];
  const vkContacts = contacts.vk || [];
  const mattermostContacts = contacts.mattermost || [];

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
    contacts: {
      telegram: telegramContacts[0] || undefined,
      skype: skypeContacts[0] || undefined,
      linkedin: linkedinContacts[0] || undefined,
      whatsapp: whatsappContacts[0] || undefined,
      vk: vkContacts[0] || undefined,
      mattermost: mattermostContacts[0] || undefined,
    },
    managerId: apiUser.managerId,
    hierarchyId: apiUser.hierarchyId,
  };
};

// Метод для обновления профиля пользователя
export const updateUserProfile = async (
  userId: string,
  userData: Partial<User>
): Promise<User> => {
  // Валидация UUID
  if (!userService.isValidUUID(userId)) {
    throw new Error("Неверный формат ID пользователя");
  }

  try {
    // Формируем contacts из отдельных полей или из объекта contacts
    const contacts: Record<string, string> = {
      email: userData.email || "",
    };

    // Добавляем мессенджеры из contacts объекта
    if (userData.contacts) {
      if (userData.contacts.telegram) {
        contacts.telegram = userData.contacts.telegram;
      }
      if (userData.contacts.skype) {
        contacts.skype = userData.contacts.skype;
      }
      if (userData.contacts.linkedin) {
        contacts.linkedin = userData.contacts.linkedin;
      }
      if (userData.contacts.whatsapp) {
        contacts.whatsapp = userData.contacts.whatsapp;
      }
      if (userData.contacts.vk) {
        contacts.vk = userData.contacts.vk;
      }
      if (userData.contacts.mattermost) {
        contacts.mattermost = userData.contacts.mattermost;
      }
    } else if (userData.messengerLink) {
      // Fallback на старое поле messengerLink (telegram)
      contacts.telegram = userData.messengerLink;
    }

    const requestBody = {
      phone: userData.phone,
      city: userData.city,
      interests: userData.interests,
      avatar: userData.avatar,
      contacts,
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
    console.log(
      "Raw contacts от API:",
      (apiData as Record<string, unknown>)?.contacts
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
      contacts: normalizeContacts(data.contacts),
      managerId: (data.managerId || data.manager_id) as string | undefined,
      hierarchyId: (data.hierarchyId || data.hierarchy_id) as
        | number
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
