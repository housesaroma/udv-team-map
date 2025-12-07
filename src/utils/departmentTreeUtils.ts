import type {
  DepartmentTreeNode,
  DepartmentUsersResponse,
  EmployeeNode,
  TreeNode,
} from "../types/organization";
import { getDepartmentColor } from "./departmentUtils";

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
});

const convertDepartmentNode = (
  node: DepartmentTreeNode,
  level: number = 0
): TreeNode => {
  const children = node.children.map(child =>
    convertDepartmentNode(child, level + 1)
  );

  return createBaseTreeNode({
    userId: `department-${node.hierarchyId}`,
    userName: node.title,
    position:
      node.children.length > 0
        ? `${node.children.length} подразделений`
        : "Листовой отдел",
    department: node.title,
    departmentColor: node.color || "#6B7280",
    level,
    isExpanded: level <= INITIAL_EXPANDED_LEVEL,
    children,
    hierarchyId: node.hierarchyId,
    nodeType: "department",
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

export const departmentTreeUtils = {
  buildStructureTree(root: DepartmentTreeNode): TreeNode[] {
    return [convertDepartmentNode(root, 0)];
  },

  buildDepartmentEmployeesTree(
    response: DepartmentUsersResponse,
    colorOverride?: string
  ): TreeNode[] {
    return [
      convertEmployeeToTreeNode(
        response.manager,
        response.title,
        colorOverride,
        0
      ),
    ];
  },
};
