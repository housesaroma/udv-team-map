import { describe, it, expect } from "vitest";
import { treeUtils } from "../treeUtils";
import type {
  EmployeeNode,
  OrganizationHierarchy,
  TreeNode,
} from "../../types/organization";

describe("treeUtils", () => {
  const mockCEO: EmployeeNode = {
    userId: "ceo-1",
    userName: "Иван Иванов",
    position: "CEO",
    avatarUrl: "/avatar.jpg",
    subordinates: [],
    department: "management",
  };

  const mockEmployee1: EmployeeNode = {
    userId: "emp-1",
    userName: "Петр Петров",
    position: "Team Lead",
    avatarUrl: "/avatar2.jpg",
    subordinates: [],
    department: "it",
  };

  const mockEmployee2: EmployeeNode = {
    userId: "emp-2",
    userName: "Мария Сидорова",
    position: "Developer",
    avatarUrl: "/avatar3.jpg",
    subordinates: [],
    department: "it",
  };

  const mockHierarchy: OrganizationHierarchy = {
    ceo: mockCEO,
    departments: [
      {
        department: "it",
        employees: [
          {
            ...mockEmployee1,
            subordinates: [mockEmployee2],
          },
        ],
      },
    ],
    totalEmployees: 3,
  };

  describe("buildTreeFromHierarchy", () => {
    it("должен строить дерево из иерархии организации", () => {
      const result = treeUtils.buildTreeFromHierarchy(mockHierarchy);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("ceo-1");
      expect(result[0].userName).toBe("Иван Иванов");
      expect(result[0].level).toBe(0);
      expect(result[0].children).toHaveLength(1);
    });

    it("должен правильно устанавливать уровни узлов", () => {
      const result = treeUtils.buildTreeFromHierarchy(mockHierarchy);

      expect(result[0].level).toBe(0); // CEO
      expect(result[0].children[0].level).toBe(1); // Team Lead
      expect(result[0].children[0].children[0].level).toBe(2); // Developer
    });

    it("должен правильно устанавливать отделы для узлов", () => {
      const result = treeUtils.buildTreeFromHierarchy(mockHierarchy);

      expect(result[0].children[0].department).toBe("it");
      expect(result[0].children[0].children[0].department).toBe("it");
    });

    it("должен обрабатывать пустую иерархию", () => {
      const emptyHierarchy: OrganizationHierarchy = {
        ceo: mockCEO,
        departments: [],
        totalEmployees: 1,
      };

      const result = treeUtils.buildTreeFromHierarchy(emptyHierarchy);

      expect(result).toHaveLength(1);
      expect(result[0].children).toHaveLength(0);
    });
  });

  describe("convertToTreeNode", () => {
    it("должен конвертировать EmployeeNode в TreeNode", () => {
      const result = treeUtils.convertToTreeNode(mockEmployee1, 1);

      expect(result.id).toBe("emp-1");
      expect(result.userId).toBe("emp-1");
      expect(result.level).toBe(1);
      expect(result.isExpanded).toBe(true);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.width).toBe(280);
      expect(result.height).toBe(140);
      expect(result.children).toEqual([]);
    });

    it("должен использовать переданный уровень", () => {
      const result = treeUtils.convertToTreeNode(mockEmployee1, 5);
      expect(result.level).toBe(5);
    });

    it("должен использовать переданный isExpanded", () => {
      const result = treeUtils.convertToTreeNode(mockEmployee1, 1, false);
      expect(result.isExpanded).toBe(false);
    });

    it("должен использовать department из node, если он определен", () => {
      // Создаем employee с определенным department
      const employeeWithDept = {
        ...mockEmployee1,
        department: "it",
      };

      const result = treeUtils.convertToTreeNode(employeeWithDept, 1);

      // Проверяем, что departmentColor установлен на основе department
      expect(result.departmentColor).toBeDefined();
      // departmentColor должен быть цветом для "it" отдела
      expect(result.departmentColor).not.toBe("#6B7280"); // не дефолтный цвет
    });

    it("должен использовать пустую строку, если department undefined", () => {
      // Создаем employee без department (undefined)
      const employeeWithoutDept: EmployeeNode = {
        userId: "emp-3",
        userName: "Тест Тестов",
        position: "Developer",
        avatarUrl: "/avatar3.jpg",
        subordinates: [],
        // department не указан (undefined)
      };

      const result = treeUtils.convertToTreeNode(employeeWithoutDept, 1);

      // Проверяем, что используется дефолтный цвет для пустого department
      expect(result.departmentColor).toBe("#6B7280"); // дефолтный цвет
    });
  });

  describe("toggleNodeExpansion", () => {
    it("должен переключать состояние развернутости узла", () => {
      const nodes: TreeNode[] = [
        {
          ...mockCEO,
          id: "ceo-1",
          isExpanded: true,
          level: 0,
          x: 0,
          y: 0,
          width: 280,
          height: 140,
          children: [
            {
              ...mockEmployee1,
              id: "emp-1",
              isExpanded: true,
              level: 1,
              x: 0,
              y: 0,
              width: 280,
              height: 140,
              children: [],
              departmentColor: "#3697FF",
            },
          ],
          departmentColor: "#6B7280",
        },
      ];

      const result = treeUtils.toggleNodeExpansion(nodes, "emp-1");

      expect(result[0].children[0].isExpanded).toBe(false);
    });

    it("должен находить и переключать узел в глубокой иерархии", () => {
      const nodes: TreeNode[] = [
        {
          ...mockCEO,
          id: "ceo-1",
          isExpanded: true,
          level: 0,
          x: 0,
          y: 0,
          width: 280,
          height: 140,
          children: [
            {
              ...mockEmployee1,
              id: "emp-1",
              isExpanded: true,
              level: 1,
              x: 0,
              y: 0,
              width: 280,
              height: 140,
              children: [
                {
                  ...mockEmployee2,
                  id: "emp-2",
                  isExpanded: true,
                  level: 2,
                  x: 0,
                  y: 0,
                  width: 280,
                  height: 140,
                  children: [],
                  departmentColor: "#3697FF",
                },
              ],
              departmentColor: "#3697FF",
            },
          ],
          departmentColor: "#6B7280",
        },
      ];

      const result = treeUtils.toggleNodeExpansion(nodes, "emp-2");

      expect(result[0].children[0].children[0].isExpanded).toBe(false);
    });

    it("должен возвращать исходные узлы, если узел не найден", () => {
      const nodes: TreeNode[] = [
        {
          ...mockCEO,
          id: "ceo-1",
          isExpanded: true,
          level: 0,
          x: 0,
          y: 0,
          width: 280,
          height: 140,
          children: [],
          departmentColor: "#6B7280",
        },
      ];

      const result = treeUtils.toggleNodeExpansion(nodes, "non-existent");

      expect(result).toEqual(nodes);
    });
  });

  describe("getAllVisibleNodes", () => {
    it("должен возвращать все видимые узлы", () => {
      const nodes: TreeNode[] = [
        {
          ...mockCEO,
          id: "ceo-1",
          isExpanded: true,
          level: 0,
          x: 0,
          y: 0,
          width: 280,
          height: 140,
          children: [
            {
              ...mockEmployee1,
              id: "emp-1",
              isExpanded: true,
              level: 1,
              x: 0,
              y: 0,
              width: 280,
              height: 140,
              children: [],
              departmentColor: "#3697FF",
            },
          ],
          departmentColor: "#6B7280",
        },
      ];

      const result = treeUtils.getAllVisibleNodes(nodes);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("ceo-1");
      expect(result[1].id).toBe("emp-1");
    });

    it("должен исключать свернутые узлы и их детей", () => {
      const nodes: TreeNode[] = [
        {
          ...mockCEO,
          id: "ceo-1",
          isExpanded: true,
          level: 0,
          x: 0,
          y: 0,
          width: 280,
          height: 140,
          children: [
            {
              ...mockEmployee1,
              id: "emp-1",
              isExpanded: false,
              level: 1,
              x: 0,
              y: 0,
              width: 280,
              height: 140,
              children: [
                {
                  ...mockEmployee2,
                  id: "emp-2",
                  isExpanded: true,
                  level: 2,
                  x: 0,
                  y: 0,
                  width: 280,
                  height: 140,
                  children: [],
                  departmentColor: "#3697FF",
                },
              ],
              departmentColor: "#3697FF",
            },
          ],
          departmentColor: "#6B7280",
        },
      ];

      const result = treeUtils.getAllVisibleNodes(nodes);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("ceo-1");
      expect(result[1].id).toBe("emp-1");
      expect(result.find(n => n.id === "emp-2")).toBeUndefined();
    });

    it("должен возвращать только корневые узлы, если все свернуты", () => {
      const nodes: TreeNode[] = [
        {
          ...mockCEO,
          id: "ceo-1",
          isExpanded: false,
          level: 0,
          x: 0,
          y: 0,
          width: 280,
          height: 140,
          children: [
            {
              ...mockEmployee1,
              id: "emp-1",
              isExpanded: true,
              level: 1,
              x: 0,
              y: 0,
              width: 280,
              height: 140,
              children: [],
              departmentColor: "#3697FF",
            },
          ],
          departmentColor: "#6B7280",
        },
      ];

      const result = treeUtils.getAllVisibleNodes(nodes);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("ceo-1");
    });
  });

  describe("calculateLayout", () => {
    it("должен рассчитывать позиции для узлов", () => {
      const nodes: TreeNode[] = [
        {
          ...mockCEO,
          id: "ceo-1",
          isExpanded: true,
          level: 0,
          x: 0,
          y: 0,
          width: 280,
          height: 140,
          children: [],
          departmentColor: "#6B7280",
        },
      ];

      const result = treeUtils.calculateLayout(nodes, 100, 0);

      expect(result[0].x).toBe(100);
      expect(result[0].y).toBe(0);
    });

    it("должен позиционировать детей под родителем", () => {
      const nodes: TreeNode[] = [
        {
          ...mockCEO,
          id: "ceo-1",
          isExpanded: true,
          level: 0,
          x: 0,
          y: 0,
          width: 280,
          height: 140,
          children: [
            {
              ...mockEmployee1,
              id: "emp-1",
              isExpanded: true,
              level: 1,
              x: 0,
              y: 0,
              width: 280,
              height: 140,
              children: [],
              departmentColor: "#3697FF",
            },
          ],
          departmentColor: "#6B7280",
        },
      ];

      const result = treeUtils.calculateLayout(nodes, 100, 0);

      expect(result[0].y).toBe(0);
      // calculateLayout возвращает массив с CEO и его детьми в children, не как отдельные элементы
      // Проверяем, что дети позиционированы правильно
      expect(result[0].children.length).toBeGreaterThan(0);
      if (result[0].children.length > 0) {
        expect(result[0].children[0].y).toBe(300); // VERTICAL_SPACING = 300
      }
    });

    it("должен обрабатывать свернутые узлы", () => {
      const nodes: TreeNode[] = [
        {
          ...mockCEO,
          id: "ceo-1",
          isExpanded: false,
          level: 0,
          x: 0,
          y: 0,
          width: 280,
          height: 140,
          children: [
            {
              ...mockEmployee1,
              id: "emp-1",
              isExpanded: true,
              level: 1,
              x: 0,
              y: 0,
              width: 280,
              height: 140,
              children: [],
              departmentColor: "#3697FF",
            },
          ],
          departmentColor: "#6B7280",
        },
      ];

      const result = treeUtils.calculateLayout(nodes, 100, 0);

      // calculateLayout всегда возвращает массив с CEO
      expect(result).toHaveLength(1);
      // Когда узел свернут, дети не позиционируются, но остаются в массиве children
      // Проверяем, что узел свернут
      expect(result[0].isExpanded).toBe(false);
    });

    it("должен обрабатывать несколько отделов (departmentNodes)", () => {
      // Создаем иерархию с CEO и несколькими отделами
      const dept1Node: TreeNode = {
        ...mockEmployee1,
        id: "dept-1",
        isExpanded: true,
        level: 1,
        x: 0,
        y: 0,
        width: 280,
        height: 140,
        children: [],
        departmentColor: "#3697FF",
      };

      const dept2Node: TreeNode = {
        ...mockEmployee2,
        id: "dept-2",
        isExpanded: true,
        level: 1,
        x: 0,
        y: 0,
        width: 280,
        height: 140,
        children: [],
        departmentColor: "#24D07A",
      };

      const nodes: TreeNode[] = [
        {
          ...mockCEO,
          id: "ceo-1",
          isExpanded: true,
          level: 0,
          x: 0,
          y: 0,
          width: 280,
          height: 140,
          children: [],
          departmentColor: "#6B7280",
        },
        dept1Node,
        dept2Node,
      ];

      const result = treeUtils.calculateLayout(nodes, 500, 0);

      // Должен вернуть CEO и оба отдела
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe("ceo-1");
      expect(result[1].id).toBe("dept-1");
      expect(result[2].id).toBe("dept-2");

      // CEO должен быть на стартовой позиции
      expect(result[0].x).toBe(500);
      expect(result[0].y).toBe(0);

      // Отделы должны быть позиционированы под CEO
      expect(result[1].y).toBe(300); // VERTICAL_SPACING = 300
      expect(result[2].y).toBe(300);

      // Отделы должны быть распределены горизонтально
      expect(result[1].x).not.toBe(result[2].x);
    });
  });
});
