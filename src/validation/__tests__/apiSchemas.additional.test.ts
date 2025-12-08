import { describe, it, expect } from "vitest";
import {
  organizationHierarchySchema,
  departmentTreeSchema,
  departmentUsersSchema,
  hierarchyV2Schema,
} from "../apiSchemas";
import { MOCK_HIERARCHY_V2 } from "../../constants/mockHierarchyV2";

describe("apiSchemas edge cases", () => {
  describe("organizationHierarchySchema", () => {
    it("должен валидировать корректный ответ иерархии", () => {
      const validData = {
        ceo: {
          userId: "ceo-1",
          userName: "CEO Name",
          position: "CEO",
          avatarUrl: "",
          subordinates: [],
        },
        departments: [
          {
            department: "IT",
            employees: [
              {
                userId: "emp-1",
                userName: "Employee",
                position: "Developer",
                avatarUrl: "",
                subordinates: [],
              },
            ],
          },
        ],
        totalEmployees: 2,
      };

      const result = organizationHierarchySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("departmentTreeSchema", () => {
    it("должен валидировать корректное дерево отделов", () => {
      const validData = {
        hierarchyId: 1,
        level: 0,
        title: "Root Department",
        color: "#000000",
        children: [
          {
            hierarchyId: 2,
            level: 1,
            title: "Child Department",
            color: "#111111",
            children: [],
          },
        ],
      };

      const result = departmentTreeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("departmentUsersSchema", () => {
    it("должен валидировать ответ с manager = null", () => {
      const validData = {
        hierarchyId: 100,
        title: "Department",
        manager: null,
        employees: [
          {
            userId: "user-1",
            userName: "User Name",
            position: "Position",
            avatarUrl: "",
          },
        ],
      };

      const result = departmentUsersSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("должен валидировать ответ с manager объектом", () => {
      const validData = {
        hierarchyId: 100,
        title: "Department",
        manager: {
          userId: "mgr-1",
          userName: "Manager Name",
          position: "Manager",
          avatarUrl: "",
          subordinates: [],
        },
        employees: [],
      };

      const result = departmentUsersSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("hierarchyV2Schema", () => {
    it("валидирует сложное дерево", () => {
      const result = hierarchyV2Schema.safeParse(MOCK_HIERARCHY_V2);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.children.length).toBeGreaterThan(0);
      }
    });
  });
});
