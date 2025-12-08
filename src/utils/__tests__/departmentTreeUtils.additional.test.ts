import { describe, it, expect } from "vitest";
import {
  departmentTreeTestUtils,
  departmentTreeUtils,
} from "../departmentTreeUtils";
import type {
  DepartmentTreeNode,
  DepartmentUsersResponse,
  EmployeeNode,
  FullHierarchyNode,
} from "../../types/organization";
import { getDepartmentHierarchyColor } from "../departmentUtils";

describe("departmentTreeUtils", () => {
  describe("buildDepartmentEmployeesTree edge cases", () => {
    it("должен обработать отдел без менеджера и с employees", () => {
      const response: DepartmentUsersResponse = {
        hierarchyId: 100,
        title: "Тестовый отдел",
        manager: null,
        employees: [
          {
            userId: "user-1",
            userName: "Иванов Иван",
            position: "Developer",
            avatarUrl: "",
          },
          {
            userId: "user-2",
            userName: "Петров Петр",
            position: "Analyst",
            avatarUrl: "",
          },
        ],
      };

      const result = departmentTreeUtils.buildDepartmentEmployeesTree(response);

      expect(result).toHaveLength(1);
      expect(result[0].userName).toBe("Тестовый отдел");
      expect(result[0].children).toHaveLength(2);
      expect(result[0].children[0].userName).toBe("Иванов Иван");
      expect(result[0].children[1].userName).toBe("Петров Петр");
      expect(result[0].children[0].hierarchyId).toBe(100);
      expect(result[0].children[0].hierarchyPath).toEqual([100]);
    });

    it("должен применить colorOverride когда передан", () => {
      const response: DepartmentUsersResponse = {
        hierarchyId: 101,
        title: "Тестовый отдел",
        manager: null,
        employees: [
          {
            userId: "user-1",
            userName: "Иванов Иван",
            position: "Developer",
            avatarUrl: "",
          },
        ],
      };

      const customColor = "#FF5733";
      const result = departmentTreeUtils.buildDepartmentEmployeesTree(
        response,
        customColor
      );

      expect(result[0].departmentColor).toBe(customColor);
      expect(result[0].children[0].departmentColor).toBe(customColor);
    });
  });

  describe("buildStructureTree edge cases", () => {
    it("должен обработать root без hierarchyId", () => {
      const root: DepartmentTreeNode = {
        hierarchyId: 0,
        level: 0,
        title: "Root",
        color: "#000000",
        children: [],
      };

      const result = departmentTreeUtils.buildStructureTree(root);

      expect(result).toHaveLength(1);
      expect(result[0].userName).toBe("Root");
    });

    it("должен использовать expandedPath когда передан", () => {
      const root: DepartmentTreeNode = {
        hierarchyId: 1,
        level: 0,
        title: "Root",
        color: "#000000",
        children: [
          {
            hierarchyId: 2,
            level: 1,
            title: "Child",
            color: "#111111",
            children: [],
          },
        ],
      };

      const result = departmentTreeUtils.buildStructureTree(root, [1, 2]);

      expect(result[0].isExpanded).toBe(true);
      expect(result[0].children[0].isExpanded).toBe(true);
    });

    it("должен добавлять hierarchyId в путь когда expandedPath не задан", () => {
      const root: DepartmentTreeNode = {
        hierarchyId: 7,
        level: 0,
        title: "Root",
        color: "#ffffff",
        children: [],
      };

      const result = departmentTreeUtils.buildStructureTree(root);

      expect(result[0].hierarchyPath).toEqual([7]);
    });
  });

  describe("createBaseTreeNode defaults", () => {
    it("должен применять значения по умолчанию", () => {
      const node = departmentTreeTestUtils.createBaseTreeNode({
        userId: "node-1",
        userName: "Node",
        position: "Lead",
        department: "QA",
        departmentColor: "#000000",
      });

      expect(node.isExpanded).toBe(true);
      expect(node.level).toBe(0);
      expect(node.children).toEqual([]);
      expect(node.nodeType).toBe("department");
    });
  });

  describe("convertEmployeeToTreeNode", () => {
    it("должен использовать цвет отдела когда override не передан", () => {
      const employee: EmployeeNode = {
        userId: "emp-1",
        userName: "Сотрудник",
        position: "Developer",
        avatarUrl: "",
        subordinates: [],
      };

      const node = departmentTreeTestUtils.convertEmployeeToTreeNode(
        employee,
        "HR"
      );

      expect(node.departmentColor).toBe("#24D07A");
    });

    it("сохраняет путь и hierarchyId когда он передан", () => {
      const employee: EmployeeNode = {
        userId: "emp-2",
        userName: "Второй",
        position: "QA",
        avatarUrl: "",
        subordinates: [],
      };

      const node = departmentTreeTestUtils.convertEmployeeToTreeNode(
        employee,
        "IT",
        undefined,
        1,
        [42, 43]
      );

      expect(node.hierarchyId).toBe(43);
      expect(node.hierarchyPath).toEqual([42, 43]);
    });
  });

  describe("buildFullHierarchyTree", () => {
    it("объединяет отделы и сотрудников в единое дерево", () => {
      const root: FullHierarchyNode = {
        hierarchyId: 1,
        level: 1,
        title: "Root",
        color: "#000000",
        children: [
          {
            hierarchyId: 2,
            level: 2,
            title: "Child",
            color: "#222222",
            children: [],
            manager: null,
            employees: [
              {
                userId: "emp-2",
                userName: "Child Employee",
                position: "Analyst",
                avatarUrl: "",
              },
            ],
          },
        ],
        manager: {
          userId: "mgr-1",
          userName: "Manager",
          position: "Head",
          avatarUrl: "",
          subordinates: [],
        },
        employees: [
          {
            userId: "emp-1",
            userName: "Employee",
            position: "Developer",
            avatarUrl: "",
          },
        ],
      };

      const tree = departmentTreeUtils.buildFullHierarchyTree(root);

      expect(tree).toHaveLength(1);
      const [rootNode] = tree;
      expect(rootNode.children).toHaveLength(3);
      expect(rootNode.children[0].nodeType).toBe("department");
      expect(rootNode.children[1].nodeType).toBe("employee");
      expect(rootNode.children[2].userName).toBe("Employee");
    });

    it("использует те же цвета, что дерево отделов", () => {
      const root: FullHierarchyNode = {
        hierarchyId: 10,
        level: 0,
        title: "Root",
        color: "#000",
        children: [
          {
            hierarchyId: 11,
            level: 1,
            title: "Child",
            color: "#222",
            children: [],
            manager: null,
            employees: [],
          },
        ],
        manager: null,
        employees: [],
      };

      const [rootNode] = departmentTreeUtils.buildFullHierarchyTree(root);

      expect(rootNode.departmentColor).toBe(getDepartmentHierarchyColor(1));
      expect(rootNode.children[0].departmentColor).toBe(
        getDepartmentHierarchyColor(2)
      );
    });

    it("не дублирует сотрудников если они уже есть в менеджерах", () => {
      const root: FullHierarchyNode = {
        hierarchyId: 20,
        level: 0,
        title: "Root",
        color: "#000",
        children: [],
        manager: {
          userId: "mgr",
          userName: "Manager",
          position: "Lead",
          avatarUrl: "",
          subordinates: [
            {
              userId: "dup",
              userName: "Duplicate",
              position: "Dev",
              avatarUrl: "",
              subordinates: [],
            },
          ],
        },
        employees: [
          {
            userId: "dup",
            userName: "Duplicate",
            position: "Dev",
            avatarUrl: "",
          },
          {
            userId: "uniq",
            userName: "Unique",
            position: "QA",
            avatarUrl: "",
          },
        ],
      };

      const [rootNode] = departmentTreeUtils.buildFullHierarchyTree(root);
      const employeeNodes = rootNode.children.filter(
        child => child.nodeType === "employee"
      );

      expect(employeeNodes.map(node => node.userId)).toEqual(["mgr", "uniq"]);
      expect(employeeNodes[0].hierarchyId).toBe(20);
      expect(employeeNodes[0].hierarchyPath).toEqual([20]);
    });

    it("не добавляет hierarchyId в путь когда он равен 0", () => {
      const root: FullHierarchyNode = {
        hierarchyId: 0,
        level: 0,
        title: "Zero Root",
        color: "#000",
        children: [
          {
            hierarchyId: 3,
            level: 1,
            title: "Child",
            color: "#222",
            children: [],
            manager: null,
            employees: [],
          },
        ],
        manager: null,
        employees: [],
      };

      const [rootNode] = departmentTreeUtils.buildFullHierarchyTree(root);

      expect(rootNode.hierarchyPath).toEqual([]);
      expect(rootNode.children[0].hierarchyPath).toEqual([3]);
    });
  });
});
