import type {
  DepartmentTreeNode,
  DepartmentUsersResponse,
  EmployeeNode,
  FullHierarchyNode,
  OrganizationHierarchy,
} from "../types/organization";
import {
  API_DEPARTMENT_TREE,
  API_DEPARTMENT_USERS,
  API_HIERARCHY,
  API_HIERARCHY_V2,
} from "../constants/apiConstants";
import { MOCK_HIERARCHY } from "../constants/mockUsersHierarchy";
import { MOCK_DEPARTMENT_TREE } from "../constants/mockDepartmentTree";
import { getMockDepartmentUsers } from "../constants/mockDepartmentUsers";
import { MOCK_HIERARCHY_V2 } from "../constants/mockHierarchyV2";
import { apiClient } from "../utils/apiClient";
import {
  departmentTreeSchema,
  departmentUsersSchema,
  hierarchyV2Schema,
  organizationHierarchySchema,
} from "../validation/apiSchemas";

export const organizationService = {
  async getOrganizationHierarchy(): Promise<OrganizationHierarchy> {
    console.log("🌐 Загрузка данных организационной структуры...");
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
      console.error(
        "Ошибка загрузки организационной структуры, используем мок-данные:",
        error
      );
      return this.enrichWithDepartments(MOCK_HIERARCHY);
    }
  },

  async getFullHierarchyTree(): Promise<FullHierarchyNode> {
    console.log("🌐 Загрузка расширенного дерева иерархии...");
    try {
      const response = await apiClient.get<FullHierarchyNode>(
        API_HIERARCHY_V2,
        {
          validateStatus: () => true,
        }
      );

      if (response.status >= 400) {
        throw new Error(
          `Ошибка загрузки расширенной иерархии: ${response.status}`
        );
      }

      const parsed = hierarchyV2Schema.safeParse(response.data);

      if (!parsed.success) {
        console.error("Некорректное дерево иерархии V2 от сервера:", {
          issues: parsed.error.flatten(),
        });
        throw new Error("Некорректный ответ сервера");
      }

      return parsed.data;
    } catch (error) {
      console.error(
        "Ошибка загрузки расширенного дерева иерархии, используем мок-данные:",
        error
      );
      return MOCK_HIERARCHY_V2;
    }
  },

  async getDepartmentTree(): Promise<DepartmentTreeNode> {
    console.log("🌐 Загрузка дерева департаментов...");

    try {
      const response = await apiClient.get<DepartmentTreeNode>(
        API_DEPARTMENT_TREE,
        {
          validateStatus: () => true,
        }
      );

      if (response.status >= 400) {
        throw new Error(
          `Ошибка загрузки дерева департаментов: ${response.status}`
        );
      }

      const parsed = departmentTreeSchema.safeParse(response.data);

      if (!parsed.success) {
        console.error("Некорректное дерево департаментов от сервера:", {
          issues: parsed.error.flatten(),
        });
        throw new Error("Некорректный ответ сервера");
      }

      return parsed.data;
    } catch (error) {
      console.error(
        "Ошибка загрузки дерева департаментов, используем мок-данные:",
        error
      );
      return MOCK_DEPARTMENT_TREE;
    }
  },

  async getDepartmentUsers(
    hierarchyId: number
  ): Promise<DepartmentUsersResponse> {
    console.log(`🌐 Загрузка сотрудников департамента ${hierarchyId}...`);

    try {
      const response = await apiClient.get<DepartmentUsersResponse>(
        API_DEPARTMENT_USERS(hierarchyId),
        {
          validateStatus: () => true,
        }
      );

      if (response.status >= 400) {
        throw new Error(
          `Ошибка загрузки сотрудников департамента: ${response.status}`
        );
      }

      const parsed = departmentUsersSchema.safeParse(response.data);

      if (!parsed.success) {
        console.error(
          "Некорректные данные сотрудников департамента от сервера:",
          {
            issues: parsed.error.flatten(),
          }
        );
        throw new Error("Некорректный ответ сервера");
      }

      return parsed.data;
    } catch (error) {
      console.error(
        "Ошибка загрузки сотрудников департамента, используем мок-данные:",
        error
      );
      return getMockDepartmentUsers(hierarchyId);
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
};
