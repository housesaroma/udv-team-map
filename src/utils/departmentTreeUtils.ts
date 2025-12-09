import type {
  DepartmentTreeNode,
  DepartmentUsersResponse,
  EmployeeNode,
  FullHierarchyNode,
  TreeNode,
} from "../types/organization";
import {
  getDepartmentColor,
  getDepartmentHierarchyColor,
} from "./departmentUtils";

const DEFAULT_NODE_WIDTH = 360;
const DEFAULT_NODE_HEIGHT = 140;
const EMPLOYEE_NODE_HEIGHT = 220;
const DEPARTMENT_NODE_HEIGHT = DEFAULT_NODE_HEIGHT;
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
    height: DEPARTMENT_NODE_HEIGHT,
  });
};

const convertEmployeeToTreeNode = (
  employee: EmployeeNode,
  departmentTitle: string,
  colorOverride?: string,
  level: number = 0,
  hierarchyPath: number[] = []
): TreeNode => {
  const children = employee.subordinates.map(child =>
    convertEmployeeToTreeNode(
      child,
      departmentTitle,
      colorOverride,
      level + 1,
      hierarchyPath
    )
  );

  const normalizedPath = hierarchyPath.length > 0 ? [...hierarchyPath] : [];
  const effectiveHierarchyId =
    normalizedPath.length > 0
      ? normalizedPath[normalizedPath.length - 1]
      : undefined;

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
    hierarchyPath: normalizedPath.length > 0 ? normalizedPath : undefined,
    hierarchyId: effectiveHierarchyId,
    height: EMPLOYEE_NODE_HEIGHT,
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

const collectTreeNodeIds = (node: TreeNode, acc: Set<string>): void => {
  acc.add(node.id);
  for (const child of node.children) {
    collectTreeNodeIds(child, acc);
  }
};

const convertFullHierarchyNode = (
  node: FullHierarchyNode,
  level: number = 0,
  parentPath: number[] = []
): TreeNode => {
  const currentPath = node.hierarchyId
    ? [...parentPath, node.hierarchyId]
    : [...parentPath];
  const departmentColor = getDepartmentHierarchyColor(level + 1);

  const departmentChildren = node.children.map(child =>
    convertFullHierarchyNode(child, level + 1, currentPath)
  );

  const employeeNodes: TreeNode[] = [];
  const usedIds = new Set<string>();

  if (node.manager) {
    const managerNode = convertEmployeeToTreeNode(
      node.manager,
      node.title,
      departmentColor,
      level + 1,
      currentPath
    );
    collectTreeNodeIds(managerNode, usedIds);
    employeeNodes.push(managerNode);
  }

  if (node.employees.length > 0) {
    const directEmployees = summariesToEmployees(node.employees)
      .map(summary =>
        convertEmployeeToTreeNode(
          summary,
          node.title,
          departmentColor,
          level + 1,
          currentPath
        )
      )
      .filter(employeeNode => {
        if (usedIds.has(employeeNode.id)) {
          return false;
        }
        usedIds.add(employeeNode.id);
        return true;
      });
    employeeNodes.push(...directEmployees);
  }

  return createBaseTreeNode({
    userId: `full-${node.hierarchyId}`,
    userName: node.title,
    position: node.title,
    department: node.title,
    departmentColor,
    level,
    children: [...departmentChildren, ...employeeNodes],
    hierarchyId: node.hierarchyId,
    nodeType: "department",
    hierarchyPath: currentPath,
    isExpanded: true,
    height: DEPARTMENT_NODE_HEIGHT,
  });
};

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
    const departmentColor = colorOverride ?? getDepartmentColor(response.title);
    const managerChildren = response.manager
      ? [
          convertEmployeeToTreeNode(
            response.manager,
            response.title,
            departmentColor,
            1,
            [response.hierarchyId]
          ),
        ]
      : summariesToEmployees(response.employees).map(employee =>
          convertEmployeeToTreeNode(
            employee,
            response.title,
            departmentColor,
            1,
            [response.hierarchyId]
          )
        );

    return [
      createBaseTreeNode({
        userId: `department-${response.hierarchyId}`,
        userName: response.title,
        position: response.title,
        department: response.title,
        departmentColor,
        hierarchyId: response.hierarchyId,
        nodeType: "department",
        level: 0,
        isExpanded: true,
        children: managerChildren,
        height: DEPARTMENT_NODE_HEIGHT,
      }),
    ];
  },

  buildFullHierarchyTree(root: FullHierarchyNode): TreeNode[] {
    return [convertFullHierarchyNode(root)];
  },
};

export const departmentTreeTestUtils = {
  createBaseTreeNode,
  convertEmployeeToTreeNode,
};
