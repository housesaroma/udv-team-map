import type {
  DepartmentTreeNode,
  DepartmentUsersResponse,
  EmployeeNode,
  TreeNode,
} from "../types/organization";
import {
  getDepartmentColor,
  getDepartmentHierarchyColor,
} from "./departmentUtils";

const DEFAULT_NODE_WIDTH = 280;
const DEFAULT_NODE_HEIGHT = 140;
const INITIAL_EXPANDED_LEVEL = 2;

const createBaseTreeNode = (
  payload: Pick<
    TreeNode,
    "userId" | "userName" | "position" | "department" | "departmentColor"
  > &
    Partial<TreeNode>
): TreeNode => ({
  userId: payload.userId,
  userName: payload.userName,
  position: payload.position,
  department: payload.department,
  departmentColor: payload.departmentColor,
  avatarUrl: payload.avatarUrl ?? "",
  subordinates: payload.subordinates ?? [],
  id: payload.id ?? payload.userId,
  isExpanded: payload.isExpanded ?? true,
  level: payload.level ?? 0,
  x: payload.x ?? 0,
  y: payload.y ?? 0,
  width: payload.width ?? DEFAULT_NODE_WIDTH,
  height: payload.height ?? DEFAULT_NODE_HEIGHT,
  children: payload.children ?? [],
  hierarchyId: payload.hierarchyId,
  nodeType: payload.nodeType ?? "department",
  hierarchyPath: payload.hierarchyPath,
});

const convertDepartmentNode = (
  node: DepartmentTreeNode,
  level: number = 0,
  parentPath: number[] = [],
  expandedPath: number[] = []
): TreeNode => {
  const currentPath = node.hierarchyId
    ? [...parentPath, node.hierarchyId]
    : [...parentPath];

  const children = node.children.map(child =>
    convertDepartmentNode(child, level + 1, currentPath, expandedPath)
  );

  const shouldExpand =
    level === 0 ||
    (node.hierarchyId !== undefined && expandedPath.includes(node.hierarchyId));

  return createBaseTreeNode({
    userId: `department-${node.hierarchyId}`,
    userName: node.title,
    position: node.title,
    department: node.title,
    departmentColor: getDepartmentHierarchyColor(level + 1),
    level,
    isExpanded: shouldExpand,
    children,
    hierarchyId: node.hierarchyId,
    nodeType: "department",
    hierarchyPath: currentPath,
  });
};

const convertEmployeeToTreeNode = (
  employee: EmployeeNode,
  departmentTitle: string,
  colorOverride?: string,
  level: number = 0
): TreeNode => {
  const children = employee.subordinates.map(child =>
    convertEmployeeToTreeNode(child, departmentTitle, colorOverride, level + 1)
  );

  return createBaseTreeNode({
    userId: employee.userId,
    userName: employee.userName,
    position: employee.position,
    department: departmentTitle,
    departmentColor: colorOverride ?? getDepartmentColor(departmentTitle),
    subordinates: employee.subordinates,
    isExpanded: level <= INITIAL_EXPANDED_LEVEL,
    level,
    children,
    nodeType: "employee",
  });
};

const summariesToEmployees = (
  summaries: DepartmentUsersResponse["employees"]
): EmployeeNode[] =>
  summaries.map(summary => ({
    userId: summary.userId,
    userName: summary.userName,
    position: summary.position,
    avatarUrl: summary.avatarUrl,
    subordinates: [],
  }));

export const departmentTreeUtils = {
  buildStructureTree(
    root: DepartmentTreeNode,
    expandedPath: number[] = []
  ): TreeNode[] {
    const normalizedPath =
      expandedPath.length > 0
        ? expandedPath
        : root.hierarchyId
          ? [root.hierarchyId]
          : [];

    return [convertDepartmentNode(root, 0, [], normalizedPath)];
  },

  buildDepartmentEmployeesTree(
    response: DepartmentUsersResponse,
    colorOverride?: string
  ): TreeNode[] {
    const managerNode: EmployeeNode = response.manager ?? {
      userId: `department-${response.hierarchyId}-root`,
      userName: response.title,
      position: "Команда отдела",
      avatarUrl: "",
      subordinates: summariesToEmployees(response.employees),
    };

    return [
      convertEmployeeToTreeNode(managerNode, response.title, colorOverride, 0),
    ];
  },
};
