import {
  API_USER_BY_ID,
  API_USERS,
  API_HIERARCHIES,
} from "../constants/apiConstants";
import { MOCK_USERS_RESPONSE } from "../constants/mockUsersProfile";
import type { ApiUserProfile, User } from "../types";
import type { SortToken } from "../types/ui";
import { getDepartmentColor } from "../utils/departmentUtils";
import { apiClient } from "../utils/apiClient";
import { organizationService } from "./organizationService";
import type { FullHierarchyNode } from "../types/organization";
import {
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
  userId: string;
  department: string;
  position: string;
}

// Вспомогательная функция для проверки, является ли строка base64
const isBase64 = (str: string): boolean => {
  return /^[A-Za-z0-9+/]*={0,2}$/.test(str.trim());
};

// Вспомогательная функция для декодирования base64 строк
const decodeBase64 = (str: string): string => {
  if (isBase64(str)) {
    try {
      return atob(str.replace(/-/g, "+").replace(/_/g, "/"));
    } catch {
      return str;
    }
  } else {
    return str;
  }
};

// Вспомогательная функция для преобразования ApiUserProfile в User
const transformApiUserToUser = (apiUser: ApiUserProfile): User => {
  const nameParts = apiUser.userName.split(" ");

  const decodedDepartment = decodeBase64(apiUser.department.replace(/^: /, ""));
  // Используем hierarchyColor из API, если он есть, иначе fallback на getDepartmentColor
  const departmentColor =
    apiUser.hierarchyColor || getDepartmentColor(decodedDepartment);

  return {
    id: apiUser.userId,
    firstName: nameParts[1] || "", // Имя
    lastName: nameParts[0] || "", // Фамилия
    middleName: nameParts[2] || "", // Отчество
    position: apiUser.position,
    department: {
      id: decodedDepartment,
      name: decodedDepartment,
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
    console.log("🌐 Загрузка данных пользователей...", params);
    try {
      const queryString = buildQueryString(params);
      const url = `${API_USERS}?${queryString}`;

      console.log("🌐 Загрузка данных пользователей с url:", url);

      const response = await apiClient.get<UsersResponse>(url, {
        validateStatus: () => true,
      });

      if (response.status >= 400) {
        throw new Error(`Ошибка загрузки пользователей: ${response.status}`);
      }

      const rawData = response.data;
      const parsed = usersResponseSchema.safeParse(rawData);

      if (!parsed.success) {
        console.error("Некорректный ответ при загрузке пользователей:", {
          issues: parsed.error.flatten(),
        });
        throw new Error("Некорректный ответ сервера");
      }

      return parsed.data;
    } catch (error) {
      console.error(
        "Ошибка загрузки пользователей, используем мок-данные:",
        error
      );
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
    try {
      const response = await apiClient.put<UpdateUserResponse>(
        API_USER_BY_ID(userId),
        updateData,
        {
          validateStatus: () => true,
        }
      );

      if (response.status >= 400) {
        throw new Error(`Ошибка обновления пользователя: ${response.status}`);
      }

      const rawData = response.data;
      console.log("Ответ сервера на обновление пользователя (raw):", rawData);

      const parsed = updateUserResponseSchema.safeParse(rawData);

      if (!parsed.success) {
        console.error("Некорректный ответ при обновлении пользователя:", {
          issues: parsed.error.flatten(),
        });
        throw new Error("Некорректный ответ сервера");
      }

      console.log("Валидированные данные после обновления:", parsed.data);
      return parsed.data;
    } catch (error) {
      console.error("Ошибка обновления пользователя:", error);
      throw error;
    }
  },

  // Метод для получения всех доступных подразделений
  async getAllDepartments(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>(API_HIERARCHIES);
      return response.data.sort(collator.compare);
    } catch (error) {
      console.error(
        "Не удалось получить список подразделений, используем мок-данные",
        error
      );
      // Fallback to mock data if API fails
      return getFallbackDepartmentsFromMocks();
    }
  },

  // Метод для получения всех доступных должностей
  async getAllPositions(): Promise<string[]> {
    const { positions } = await loadHierarchyFilterOptions();
    return positions;
  },
};

type FilterOptions = {
  departments: string[];
  positions: string[];
};

const collator = new Intl.Collator("ru-RU");

let cachedFilterOptions: FilterOptions | null = null;
let filterOptionsPromise: Promise<FilterOptions> | null = null;

const loadHierarchyFilterOptions = async (): Promise<FilterOptions> => {
  if (cachedFilterOptions) {
    return cachedFilterOptions;
  }

  if (!filterOptionsPromise) {
    filterOptionsPromise = organizationService
      .getFullHierarchyTree()
      .then(extractFilterOptionsFromHierarchy)
      .then(options => {
        cachedFilterOptions = options;
        return options;
      })
      .catch(error => {
        console.error(
          "Не удалось получить дерево иерархии для фильтров, используем мок-данные",
          error
        );
        const fallback = getFallbackFilterOptionsFromMocks();
        cachedFilterOptions = fallback;
        return fallback;
      })
      .finally(() => {
        filterOptionsPromise = null;
      });
  }

  return filterOptionsPromise;
};

const extractFilterOptionsFromHierarchy = (
  root: FullHierarchyNode
): FilterOptions => {
  const departmentSet = new Set<string>();
  const positionSet = new Set<string>();

  const traverse = (node: FullHierarchyNode) => {
    if (node.title.trim()) {
      departmentSet.add(node.title.trim());
    }

    if (node.manager?.position?.trim()) {
      positionSet.add(node.manager.position.trim());
    }

    for (const employee of node.employees) {
      if (employee.position.trim()) {
        positionSet.add(employee.position.trim());
      }
    }

    for (const child of node.children) {
      traverse(child);
    }
  };

  traverse(root);

  return {
    departments: Array.from(departmentSet).sort(collator.compare),
    positions: Array.from(positionSet).sort(collator.compare),
  };
};

const getFallbackDepartmentsFromMocks = (): string[] => {
  const departmentSet = new Set(
    MOCK_USERS_RESPONSE.usersTable
      .map(user => user.department.trim())
      .filter(Boolean)
  );

  return Array.from(departmentSet).sort(collator.compare);
};

const getFallbackFilterOptionsFromMocks = (): FilterOptions => {
  const departmentSet = new Set(
    MOCK_USERS_RESPONSE.usersTable
      .map(user => user.department.trim())
      .filter(Boolean)
  );
  const positionSet = new Set(
    MOCK_USERS_RESPONSE.usersTable
      .map(user => user.position.trim())
      .filter(Boolean)
  );

  return {
    departments: Array.from(departmentSet).sort(collator.compare),
    positions: Array.from(positionSet).sort(collator.compare),
  };
};
