export interface EmployeeNode {
  userId: string;
  userName: string;
  position: string;
  avatarUrl: string;
  subordinates: EmployeeNode[];
  department?: string;
}

export interface DepartmentTreeNode {
  hierarchyId: number;
  level: number;
  title: string;
  color: string;
  children: DepartmentTreeNode[];
}

export interface DepartmentEmployeeSummary {
  userId: string;
  userName: string;
  position: string;
  avatarUrl: string;
}

export interface DepartmentUsersResponse {
  hierarchyId: number;
  title: string;
  manager: EmployeeNode | null;
  employees: DepartmentEmployeeSummary[];
}

export interface DepartmentHierarchy {
  department: string;
  employees: EmployeeNode[];
}

export interface OrganizationHierarchy {
  ceo: EmployeeNode;
  departments: DepartmentHierarchy[];
  totalEmployees: number;
}

export interface TreeNode extends EmployeeNode {
  id: string;
  isExpanded: boolean;
  level: number;
  x: number;
  y: number;
  width: number;
  height: number;
  children: TreeNode[];
  departmentColor: string;
  hierarchyId?: number;
  nodeType?: "department" | "employee";
  hierarchyPath?: number[];
}
