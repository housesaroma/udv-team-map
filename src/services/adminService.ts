import { API_USERS, USE_MOCK_DATA } from "../constants/apiConstants";
import { MOCK_USERS_RESPONSE } from "../constants/mockUsersProfile";
import type { ApiUserProfile, User } from "../types";
import { departmentColors } from "../utils/departmentUtils";
import { fetchWithAuth } from "../utils/apiClient";

// Типы для ответа API
export interface UsersResponse {
  amountOfUsers: number;
  usersTable: ApiUserProfile[];
  isCached: boolean;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

// Типы для параметров запроса
export interface UsersQueryParams {
  page: number;
  limit: number;
  sort?: string;
  positionFilter?: string;
  departmentFilter?: string;
  isCached?: boolean;
}

// Вспомогательная функция для преобразования ApiUserProfile в User
const transformApiUserToUser = (apiUser: ApiUserProfile): User => {
  const nameParts = apiUser.userName.split(" ");

  const departmentName = apiUser.department.toLowerCase();
  const departmentColor = departmentColors[departmentName] || "#6B7280";

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

      const data: UsersResponse = await response.json();
      return data;
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

  // Метод для получения текущего режима
  isUsingMockData(): boolean {
    return USE_MOCK_DATA;
  },
};
