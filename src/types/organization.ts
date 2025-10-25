export interface EmployeeNode {
    userId: string;
    userName: string;
    position: string;
    avatarUrl: string;
    subordinates: EmployeeNode[];
    department?: string;
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
}
