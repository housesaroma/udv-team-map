import type {
  EmployeeNode,
  OrganizationHierarchy,
} from "../types/organization";
import { API_HIERARCHY, USE_MOCK_DATA } from "../constants/apiConstants";
import { MOCK_HIERARCHY } from "../constants/mockUsersHierarchy";
import { apiClient } from "../utils/apiClient";
import { organizationHierarchySchema } from "../validation/apiSchemas";

export const organizationService = {
  async getOrganizationHierarchy(): Promise<OrganizationHierarchy> {
    // Если используем мок-данные, возвращаем их сразу
    if (USE_MOCK_DATA) {
      console.log("📁 Используются мок-данные организационной структуры");
      return this.enrichWithDepartments(MOCK_HIERARCHY);
    }

    // Иначе загружаем с бэкенда
    console.log("🌐 Загрузка данных с бэкенда...");
    try {
      const response = await apiClient.get<OrganizationHierarchy>(
        API_HIERARCHY,
        {
          validateStatus: () => true,
        }
      );

      if (response.status >= 400) {
        throw new Error(`Ошибка загрузки иерархии: ${response.status}`);
      }

      const rawData = response.data;
      const parsed = organizationHierarchySchema.safeParse(rawData);

      if (!parsed.success) {
        console.error("Некорректная иерархия от сервера:", {
          issues: parsed.error.flatten(),
        });
        throw new Error("Некорректный ответ сервера");
      }

      return this.enrichWithDepartments(parsed.data);
    } catch (error) {
      console.error("Ошибка загрузки с бэкенда, используем мок-данные:", error);
      return this.enrichWithDepartments(MOCK_HIERARCHY);
    }
  },

  enrichWithDepartments(data: OrganizationHierarchy): OrganizationHierarchy {
    // Создаем глубокую копию чтобы не мутировать оригинальные данные
    const enrichedData = structuredClone(data);

    // Добавляем CEO в IT департамент для единообразия
    enrichedData.ceo.department = "IT";

    // Обогащаем сотрудников информацией о департаментах
    for (const dept of enrichedData.departments) {
      const assignDepartment = (employee: EmployeeNode) => {
        employee.department = dept.department;
        for (const subordinate of employee.subordinates) {
          assignDepartment(subordinate);
        }
      };

      for (const employee of dept.employees) {
        assignDepartment(employee);
      }
    }

    return enrichedData;
  },

  // Метод для получения текущего режима
  isUsingMockData(): boolean {
    return USE_MOCK_DATA;
  },
};
