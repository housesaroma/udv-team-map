import type {
    EmployeeNode,
    OrganizationHierarchy,
} from "../types/organization";
import { BASE_URL } from "./apiConstants";

const API_HIERARCHY = `${BASE_URL}/api/Users/hierarchy`;

export const organizationService = {
    async getOrganizationHierarchy(): Promise<OrganizationHierarchy> {
        const response = await fetch(API_HIERARCHY);

        if (!response.ok) {
            throw new Error(`Ошибка загрузки иерархии: ${response.status}`);
        }

        const data: OrganizationHierarchy = await response.json();

        // Добавляем информацию о департаментах в узлы
        this.enrichWithDepartments(data);

        return data;
    },

    enrichWithDepartments(data: OrganizationHierarchy): void {
        // Добавляем CEO в IT департамент для единообразия
        data.ceo.department = "IT";

        // Обогащаем сотрудников информацией о департаментах
        for (const dept of data.departments) {
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
    },
};
