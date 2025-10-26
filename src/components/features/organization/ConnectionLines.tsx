import React, { useMemo } from "react";
import type { TreeNode } from "../../../types/organization";

interface ConnectionLinesProps {
    nodes: TreeNode[];
}

export const ConnectionLines: React.FC<ConnectionLinesProps> = ({ nodes }) => {
    // Функция для получения всех соединений между узлами
    const getConnections = (): Array<{
        from: { x: number; y: number; width: number; height: number };
        to: { x: number; y: number; width: number; height: number };
        id: string;
    }> => {
        const connections: Array<{
            from: { x: number; y: number; width: number; height: number };
            to: { x: number; y: number; width: number; height: number };
            id: string;
        }> = [];

        // Функция для рекурсивного обхода дерева и создания соединений
        const traverse = (nodeList: TreeNode[]) => {
            for (const node of nodeList) {
                if (node.isExpanded && node.children.length > 0) {
                    // Для каждого ребенка создаем соединение от родителя
                    for (const child of node.children) {
                        connections.push({
                            from: {
                                x: node.x + node.width / 2,
                                y: node.y + node.height,
                                width: node.width,
                                height: node.height,
                            },
                            to: {
                                x: child.x + child.width / 2,
                                y: child.y,
                                width: child.width,
                                height: child.height,
                            },
                            id: `${node.id}-${child.id}`,
                        });
                    }
                    // Рекурсивно обходим детей
                    traverse(node.children);
                }
            }
        };

        traverse(nodes);
        return connections;
    };

    const connections = useMemo(() => getConnections(), [nodes]);

    // Функция для отрисовки линии с прямыми углами
    const renderConnection = (
        from: { x: number; y: number },
        to: { x: number; y: number },
        id: string
    ) => {
        const midY = from.y + (to.y - from.y) / 2;

        const pathData = `
        M ${from.x} ${from.y}
        L ${from.x} ${midY}
        L ${to.x} ${midY}
        L ${to.x} ${to.y}
    `;

        return (
            <path
                key={id}
                d={pathData}
                stroke="rgba(255, 255, 255, 1)"
                strokeWidth="5"
                fill="none"
                className="transition-all duration-300"
                style={{
                    transition:
                        "all 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    willChange: "d",
                }}
            />
        );
    };

    return (
        <svg
            className="absolute top-0 left-0 pointer-events-none"
            style={{
                zIndex: 0,
                width: "5000px",
                height: "4000px",
                minWidth: "5000px",
                minHeight: "4000px",
            }}
        >
            {connections.map((connection) =>
                renderConnection(connection.from, connection.to, connection.id)
            )}
        </svg>
    );
};
