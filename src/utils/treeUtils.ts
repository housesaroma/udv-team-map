import type {
    EmployeeNode,
    TreeNode,
    OrganizationHierarchy,
} from "../types/organization";
import { getDepartmentColor } from "./departmentUtils";

export const treeUtils = {
    buildTreeFromHierarchy(hierarchy: OrganizationHierarchy): TreeNode[] {
        const rootNodes: TreeNode[] = [];

        // CEO - корневой узел
        const ceoNode = this.convertToTreeNode(hierarchy.ceo, 0);

        // Явно добавляем детей для CEO - руководителей отделов
        ceoNode.children = [];

        for (const dept of hierarchy.departments) {
            for (const employee of dept.employees) {
                const departmentHead = this.convertToTreeNode(employee, 1);
                departmentHead.department = dept.department;
                departmentHead.departmentColor = getDepartmentColor(
                    dept.department
                );

                this.processSubordinates(departmentHead, dept.department);
                ceoNode.children.push(departmentHead);
            }
        }

        rootNodes.push(ceoNode);
        return rootNodes;
    },

    processSubordinates(node: TreeNode, department: string): void {
        node.children = node.subordinates.map((subordinate) => {
            const childNode = this.convertToTreeNode(
                subordinate,
                node.level + 1
            );
            childNode.department = department;
            childNode.departmentColor = getDepartmentColor(department);

            // Рекурсивно обрабатываем детей
            this.processSubordinates(childNode, department);

            return childNode;
        });
    },

    convertToTreeNode(
        node: EmployeeNode,
        level: number = 0,
        isExpanded: boolean = true
    ): TreeNode {
        return {
            ...node,
            id: node.userId,
            isExpanded,
            level,
            x: 0,
            y: 0,
            width: 280,
            height: 140,
            children: [],
            departmentColor: getDepartmentColor(node.department || ""),
        };
    },

    toggleNodeExpansion(nodes: TreeNode[], nodeId: string): TreeNode[] {
        return nodes.map((node) => {
            if (node.id === nodeId) {
                return {
                    ...node,
                    isExpanded: !node.isExpanded,
                };
            }

            if (node.children.length > 0) {
                return {
                    ...node,
                    children: this.toggleNodeExpansion(node.children, nodeId),
                };
            }

            return node;
        });
    },

    getAllVisibleNodes(nodes: TreeNode[]): TreeNode[] {
        const result: TreeNode[] = [];

        const traverse = (nodeList: TreeNode[]) => {
            for (const node of nodeList) {
                result.push(node);
                if (node.isExpanded && node.children.length > 0) {
                    traverse(node.children);
                }
            }
        };

        traverse(nodes);
        return result;
    },

    calculateLayout(
        nodes: TreeNode[],
        startX: number = 4000,
        startY: number = 0
    ): TreeNode[] {
        const HORIZONTAL_SPACING = 20;
        const VERTICAL_SPACING = 300;

        // Функция для расчета ширины поддерева с учетом всех развернутых узлов
        const calculateSubtreeWidth = (node: TreeNode): number => {
            if (!node.isExpanded || node.children.length === 0) {
                return node.width;
            }

            // Суммируем ширину всех видимых детей
            let totalWidth = 0;
            for (const child of node.children) {
                totalWidth += calculateSubtreeWidth(child);
            }

            // Добавляем промежутки между детьми
            const spacing = (node.children.length - 1) * HORIZONTAL_SPACING;
            return Math.max(node.width, totalWidth + spacing);
        };

        // Функция для позиционирования узла и его детей
        const layoutNode = (
            node: TreeNode,
            x: number,
            y: number
        ): { node: TreeNode; width: number } => {
            const positionedNode = {
                ...node,
                x,
                y,
            };

            // Если узел свернут или нет детей - возвращаем как есть
            if (!node.isExpanded || node.children.length === 0) {
                return {
                    node: positionedNode,
                    width: node.width,
                };
            }

            // Рассчитываем общую ширину поддерева детей
            const subtreeWidth = calculateSubtreeWidth(node);

            // Начальная позиция для первого ребенка
            let currentX = x - subtreeWidth / 2;

            const childrenWithLayout = [];
            let totalChildrenWidth = 0;

            // Позиционируем каждого ребенка
            for (const child of node.children) {
                const childSubtreeWidth = calculateSubtreeWidth(child);

                // Ребенок позиционируется по центру своего поддерева
                const childX = currentX + childSubtreeWidth / 2;
                const childY = y + VERTICAL_SPACING;

                const laidOutChild = layoutNode(child, childX, childY);
                childrenWithLayout.push(laidOutChild.node);

                currentX += childSubtreeWidth + HORIZONTAL_SPACING;
                totalChildrenWidth += childSubtreeWidth;
            }

            // Убираем последний лишний spacing
            totalChildrenWidth +=
                (node.children.length - 1) * HORIZONTAL_SPACING;

            return {
                node: {
                    ...positionedNode,
                    children: childrenWithLayout,
                },
                width: Math.max(node.width, totalChildrenWidth),
            };
        };

        // CEO по центру сверху
        const ceoLayout = layoutNode(nodes[0], startX, startY);
        const ceoWithLayout = ceoLayout.node;

        // Руководители отделов под CEO - равномерно распределяем
        const departmentNodes = nodes.slice(1);

        if (departmentNodes.length === 0) {
            return [ceoWithLayout];
        }

        // Рассчитываем общую ширину всех отделов
        let totalDepartmentsWidth = 0;
        const departmentWidths: number[] = [];

        for (const node of departmentNodes) {
            const width = calculateSubtreeWidth(node);
            departmentWidths.push(width);
            totalDepartmentsWidth += width;
        }

        // Добавляем промежутки между отделами
        totalDepartmentsWidth +=
            (departmentNodes.length - 1) * HORIZONTAL_SPACING;

        // Начальная позиция для первого отдела
        let currentDeptX = startX - totalDepartmentsWidth / 2;

        const departmentNodesWithLayout = [];

        for (let i = 0; i < departmentNodes.length; i++) {
            const node = departmentNodes[i];
            const deptWidth = departmentWidths[i];

            // Отдел позиционируется по центру своего поддерева
            const nodeX = currentDeptX + deptWidth / 2;
            const nodeY = startY + VERTICAL_SPACING;

            const laidOutDept = layoutNode(node, nodeX, nodeY);
            departmentNodesWithLayout.push(laidOutDept.node);

            currentDeptX += deptWidth + HORIZONTAL_SPACING;
        }

        return [ceoWithLayout, ...departmentNodesWithLayout];
    },
};
