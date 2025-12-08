import { describe, it, expect } from "vitest";
import type { DepartmentUsersResponse } from "../../types/organization";
import {
  getMockDepartmentUsers,
  MOCK_DEPARTMENT_USERS,
} from "../mockDepartmentUsers";

describe("mockDepartmentUsers", () => {
  describe("getMockDepartmentUsers", () => {
    it("должен вернуть данные для существующего hierarchyId", () => {
      const result = getMockDepartmentUsers(44);

      expect(result).toBeDefined();
      expect(result.hierarchyId).toBe(44);
      expect(result.title).toBe("Направление Аналитики и документации");
      expect(result.manager).toBeDefined();
      expect(result.employees).toHaveLength(2);
    });

    it("должен вернуть fallback для несуществующего hierarchyId", () => {
      const result = getMockDepartmentUsers(999);

      expect(result).toBeDefined();
      expect(result.hierarchyId).toBeDefined();
      expect(result.title).toBeDefined();
    });

    it("должен вернуть первый ключ когда запрашивается несуществующий hierarchyId", () => {
      const result = getMockDepartmentUsers(123);
      const [firstKey] = Object.keys(MOCK_DEPARTMENT_USERS);
      const expectedHierarchyId = Number(firstKey);

      expect(result.hierarchyId).toBe(expectedHierarchyId);
    });

    it("должен содержать subordinates в manager", () => {
      const result = getMockDepartmentUsers(44);

      expect(result.manager).toBeDefined();
      expect(result.manager?.subordinates).toBeDefined();
      expect(result.manager?.subordinates.length).toBeGreaterThan(0);
    });

    it("должен содержать вложенные subordinates", () => {
      const result = getMockDepartmentUsers(44);

      const firstSubordinate = result.manager?.subordinates[0];
      expect(firstSubordinate).toBeDefined();
      expect(firstSubordinate?.subordinates).toBeDefined();
      expect(firstSubordinate?.subordinates.length).toBeGreaterThan(0);
    });

    it("должен выбросить ошибку если мок-данные отсутствуют", () => {
      const backup = new Map<number, DepartmentUsersResponse>();
      Object.entries(MOCK_DEPARTMENT_USERS).forEach(([key, value]) => {
        backup.set(Number(key), value);
        delete (
          MOCK_DEPARTMENT_USERS as Record<number, DepartmentUsersResponse>
        )[Number(key)];
      });

      try {
        expect(() => getMockDepartmentUsers(1)).toThrow(
          "Нет мок-данных для пользователей отделов"
        );
      } finally {
        backup.forEach((value, key) => {
          (MOCK_DEPARTMENT_USERS as Record<number, DepartmentUsersResponse>)[
            key
          ] = value;
        });
      }
    });
  });

  describe("MOCK_DEPARTMENT_USERS", () => {
    it("должен содержать валидные hierarchyId ключи", () => {
      const keys = Object.keys(MOCK_DEPARTMENT_USERS);
      expect(keys.length).toBeGreaterThan(0);

      keys.forEach(key => {
        const hierarchyId = Number(key);
        expect(Number.isInteger(hierarchyId)).toBe(true);
        expect(hierarchyId).toBeGreaterThan(0);
      });
    });

    it("должен содержать валидные структуры DepartmentUsersResponse", () => {
      Object.values(MOCK_DEPARTMENT_USERS).forEach(dept => {
        expect(dept.hierarchyId).toBeDefined();
        expect(typeof dept.hierarchyId).toBe("number");
        expect(dept.title).toBeDefined();
        expect(typeof dept.title).toBe("string");
        expect(Array.isArray(dept.employees)).toBe(true);
      });
    });
  });
});
