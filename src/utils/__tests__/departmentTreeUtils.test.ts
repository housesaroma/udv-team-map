import { describe, expect, it } from "vitest";
import { departmentTreeUtils } from "../departmentTreeUtils";
import type {
  DepartmentTreeNode,
  DepartmentUsersResponse,
  EmployeeNode,
} from "../../types/organization";

describe("departmentTreeUtils", () => {
  const mockDepartmentTree: DepartmentTreeNode = {
    hierarchyId: 1,
    level: 1,
    title: "UDV",
    color: "#000000",
    children: [
      {
        hierarchyId: 2,
        level: 2,
        title: "Digital",
        color: "#FF0000",
        children: [],
      },
    ],
  };

  const mockManager: EmployeeNode = {
    userId: "manager-1",
    userName: "Manager",
    position: "Head",
    avatarUrl: "",
    subordinates: [
      {
        userId: "employee-1",
        userName: "Employee",
        position: "Developer",
        avatarUrl: "",
        subordinates: [],
        department: "IT",
      },
    ],
    department: "IT",
  };

  const mockDepartmentUsers: DepartmentUsersResponse = {
    hierarchyId: 99,
    title: "IT",
    manager: mockManager,
    employees: [],
  };

  describe("buildStructureTree", () => {
    it("возвращает корневой узел дерева департаментов", () => {
      const result = departmentTreeUtils.buildStructureTree(
        mockDepartmentTree,
        [1]
      );

      expect(result).toHaveLength(1);
      expect(result[0].userName).toBe("UDV");
      expect(result[0].children).toHaveLength(1);
      expect(result[0].children[0].userName).toBe("Digital");
      expect(result[0].nodeType).toBe("department");
      expect(result[0].hierarchyId).toBe(1);
      expect(result[0].hierarchyPath).toEqual([1]);
    });

    it("разворачивает только указанную ветку", () => {
      const treeWithBranch: DepartmentTreeNode = {
        ...mockDepartmentTree,
        children: [
          {
            hierarchyId: 2,
            level: 2,
            title: "Digital",
            color: "#FF0000",
            children: [
              {
                hierarchyId: 5,
                level: 3,
                title: "Child A",
                color: "#FF0000",
                children: [],
              },
            ],
          },
          {
            hierarchyId: 3,
            level: 2,
            title: "Security",
            color: "#00FF00",
            children: [],
          },
        ],
      };

      const result = departmentTreeUtils.buildStructureTree(
        treeWithBranch,
        [1, 2]
      );

      const digitalNode = result[0].children[0];
      const securityNode = result[0].children[1];

      expect(digitalNode.isExpanded).toBe(true);
      expect(securityNode.isExpanded).toBe(false);
      expect(digitalNode.children[0].hierarchyPath).toEqual([1, 2, 5]);
    });
  });

  describe("buildDepartmentEmployeesTree", () => {
    it("создает дерево сотрудников с учетом override цвета", () => {
      const result = departmentTreeUtils.buildDepartmentEmployeesTree(
        mockDepartmentUsers,
        "#123456"
      );

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe("department-99");
      expect(result[0].departmentColor).toBe("#123456");
      expect(result[0].children[0].userId).toBe("manager-1");
      expect(result[0].nodeType).toBe("department");
    });

    it("использует цвет департамента, если override не передан", () => {
      const result =
        departmentTreeUtils.buildDepartmentEmployeesTree(mockDepartmentUsers);

      expect(result[0].departmentColor).not.toBe("#6B7280");
    });

    it("создает корневую карточку отдела даже без сотрудников", () => {
      const emptyDepartment: DepartmentUsersResponse = {
        hierarchyId: 7,
        title: "QA",
        manager: null,
        employees: [],
      };

      const result =
        departmentTreeUtils.buildDepartmentEmployeesTree(emptyDepartment);

      expect(result).toHaveLength(1);
      expect(result[0].userName).toBe("QA");
      expect(result[0].children).toHaveLength(0);
      expect(result[0].nodeType).toBe("department");
    });
  });
});
