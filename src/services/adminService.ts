import {
  API_USER_BY_ID,
  API_USERS,
  API_USERS_DEPARTMENTS,
  API_USERS_POSITIONS,
  USE_MOCK_DATA,
} from "../constants/apiConstants";
import { MOCK_USERS_RESPONSE } from "../constants/mockUsersProfile";
import type { ApiUserProfile, User } from "../types";
import type { SortToken } from "../types/ui";
import { getDepartmentColor } from "../utils/departmentUtils";
import { fetchWithAuth } from "../utils/apiClient";
import {
  stringArraySchema,
  updateUserResponseSchema,
  usersResponseSchema,
  type UpdateUserResponse,
  type UsersResponse,
} from "../validation/apiSchemas";

// Типы для параметров запроса
export interface UsersQueryParams {
  page: number;
  limit: number;
  sort?: SortToken;
  positionFilter?: string;
  departmentFilter?: string;
  isCached?: boolean;
  SearchText?: string;
}

export interface UpdateUserRequest {
  department: string;
  position: string;
}

// Вспомогательная функция для преобразования ApiUserProfile в User
const transformApiUserToUser = (apiUser: ApiUserProfile): User => {
  const nameParts = apiUser.userName.split(" ");

  const departmentName = apiUser.department;
  const departmentColor = getDepartmentColor(departmentName);

  return {
    id: apiUser.userId,
    firstName: nameParts[1] || "", // Имя
    lastName: nameParts[0] || "", // Фамилия
    middleName: nameParts[2] || "", // Отчество
    position: apiUser.position,
    department: {
      id: departmentName,
      name: apiUser.department,
      color: departmentColor,
    },
    avatar: apiUser.avatar,
    phone: apiUser.phoneNumber,
    city: apiUser.city,
    interests: apiUser.interests,
    birthDate: apiUser.bornDate,
    hireDate: apiUser.workExperience,
    messengerLink:
      apiUser.contacts?.telegram?.[0] || apiUser.contacts?.skype?.[0],
  };
};

// Функция для построения query string
const buildQueryString = (params: UsersQueryParams): string => {
  const queryParams = new URLSearchParams();

  queryParams.append("page", params.page.toString());
  queryParams.append("limit", params.limit.toString());

  if (params.sort) queryParams.append("sort", params.sort);
  if (params.positionFilter)
    queryParams.append("positionFilter", params.positionFilter);
  if (params.departmentFilter)
    queryParams.append("departmentFilter", params.departmentFilter);
  if (params.SearchText) queryParams.append("SearchText", params.SearchText);
  if (params.isCached !== undefined)
    queryParams.append("isCached", params.isCached.toString());

  return queryParams.toString();
};

export const adminService = {
  async getUsers(params: UsersQueryParams): Promise<UsersResponse> {
    // Если используем мок-данные, возвращаем их сразу
    if (USE_MOCK_DATA) {
      console.log("📁 Используются мок-данные пользователей");
      return MOCK_USERS_RESPONSE;
    }

    // Иначе загружаем с бэкенда
    console.log("🌐 Загрузка данных пользователей с бэкенда...", params);
    try {
      const queryString = buildQueryString(params);
      const url = `${API_USERS}?${queryString}`;

      console.log("🌐 Загрузка данных пользователей с url:", url);

      const response = await fetchWithAuth(url);

      if (!response.ok) {
        throw new Error(`Ошибка загрузки пользователей: ${response.status}`);
      }

      const rawData = await response.json();
      const parsed = usersResponseSchema.safeParse(rawData);

      if (!parsed.success) {
        console.error("Некорректный ответ при загрузке пользователей:", {
          issues: parsed.error.flatten(),
        });
        throw new Error("Некорректный ответ сервера");
      }

      return parsed.data;
    } catch (error) {
      console.error("Ошибка загрузки с бэкенда, используем мок-данные:", error);
      return MOCK_USERS_RESPONSE;
    }
  },

  // Метод для получения пользователей в формате User (трансформированном)
  async getUsersTransformed(params: UsersQueryParams): Promise<{
    users: User[];
    totalRecords: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    isCached: boolean;
  }> {
    const response = await this.getUsers(params);
    const transformedUsers = response.usersTable.map(transformApiUserToUser);

    return {
      users: transformedUsers,
      totalRecords: response.amountOfUsers,
      currentPage: response.currentPage,
      totalPages: response.totalPages,
      pageSize: response.pageSize,
      isCached: response.isCached,
    };
  },

  // Метод для обновления пользователя
  async updateUser(
    userId: string,
    updateData: UpdateUserRequest
  ): Promise<UpdateUserResponse> {
    if (USE_MOCK_DATA) {
      console.log("📁 Используются мок-данные для обновления пользователя");
      // Имитируем успешное обновление
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            userId,
            userName: "Обновленный пользователь",
            bornDate: "2000-01-01T00:00:00Z",
            department: updateData.department,
            position: updateData.position,
            workExperience: "2020-01-01T00:00:00Z",
            phoneNumber: "+7-999-999-99-99",
            city: "Город",
            interests: "Интересы",
            avatar: "",
            contacts: {
              skype: [],
              telegram: [],
            },
          });
        }, 500);
      });
    }

    try {
      const response = await fetchWithAuth(API_USER_BY_ID(userId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`Ошибка обновления пользователя: ${response.status}`);
      }

      const rawData = await response.json();
      const parsed = updateUserResponseSchema.safeParse(rawData);

      if (!parsed.success) {
        console.error("Некорректный ответ при обновлении пользователя:", {
          issues: parsed.error.flatten(),
        });
        throw new Error("Некорректный ответ сервера");
      }

      return parsed.data;
    } catch (error) {
      console.error("Ошибка обновления пользователя:", error);
      throw error;
    }
  },

  // Метод для получения текущего режима
  isUsingMockData(): boolean {
    return USE_MOCK_DATA;
  },

  // Метод для получения всех доступных подразделений
  async getAllDepartments(): Promise<string[]> {
    if (USE_MOCK_DATA) {
      console.log(
        "📁 Используются мок-данные для получения всех подразделений"
      );
      const departments = Array.from(
        new Set(MOCK_USERS_RESPONSE.usersTable.map(user => user.department))
      );
      return departments;
    }

    try {
      console.log("🌐 Загрузка всех подразделений с бэкенда...");
      const response = await fetchWithAuth(API_USERS_DEPARTMENTS);

      if (!response.ok) {
        throw new Error(`Ошибка загрузки подразделений: ${response.status}`);
      }

      const rawData = await response.json();
      const parsed = stringArraySchema.safeParse(rawData);

      if (!parsed.success) {
        console.error("Некорректный список подразделений:", {
          issues: parsed.error.flatten(),
        });
        throw new Error("Некорректный ответ сервера");
      }

      return parsed.data;
    } catch (error) {
      console.error("Ошибка загрузки подразделений:", error);
      // Возвращаем пустой массив в случае ошибки
      return [];
    }
  },

  // Метод для получения всех доступных должностей
  async getAllPositions(): Promise<string[]> {
    if (USE_MOCK_DATA) {
      console.log("📁 Используются мок-данные для получения всех должностей");
      const positions = Array.from(
        new Set(MOCK_USERS_RESPONSE.usersTable.map(user => user.position))
      );
      return positions;
    }

    try {
      console.log("🌐 Загрузка всех должностей с бэкенда...");
      const response = await fetchWithAuth(API_USERS_POSITIONS);

      if (!response.ok) {
        throw new Error(`Ошибка загрузки должностей: ${response.status}`);
      }

      const rawData = await response.json();
      const parsed = stringArraySchema.safeParse(rawData);

      if (!parsed.success) {
        console.error("Некорректный список должностей:", {
          issues: parsed.error.flatten(),
        });
        throw new Error("Некорректный ответ сервера");
      }

      return parsed.data;
    } catch (error) {
      console.error("Ошибка загрузки должностей:", error);
      // Возвращаем пустой массив в случае ошибки
      return [];
    }
  },
};
