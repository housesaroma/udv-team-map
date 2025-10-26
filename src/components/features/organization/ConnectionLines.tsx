import React from "react";
import type { TreeNode } from "../../../types/organization";

interface ConnectionLinesProps {
    nodes: TreeNode[];
}

export const ConnectionLines: React.FC<ConnectionLinesProps> = ({ nodes }) => {
    // Функция для получения всех соединений между узлами
    const getConnections = (): Array<{
        from: { x: number; y: number; width: number; height: number };
        to: { x: number; y: number; width: number; height: number };
    }> => {
        const connections: Array<{
            from: { x: number; y: number; width: number; height: number };
            to: { x: number; y: number; width: number; height: number };
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

    const connections = getConnections();

    // Функция для отрисовки линии с прямыми углами
    const renderConnection = (
        from: { x: number; y: number },
        to: { x: number; y: number }
    ) => {
        const midY = from.y + (to.y - from.y) / 2;

        // Создаем путь с прямыми углами: вниз от родителя, затем горизонтально, затем вниз к ребенку
        const pathData = `
            M ${from.x} ${from.y}
            L ${from.x} ${midY}
            L ${to.x} ${midY}
            L ${to.x} ${to.y}
        `;

        return (
            <path
                key={`${from.x}-${from.y}-${to.x}-${to.y}`}
                d={pathData}
                stroke="rgba(255, 255, 255, 1)"
                strokeWidth="5"
                fill="none"
                className="transition-all duration-300"
            />
        );
    };

    return (
        <svg
            className="absolute top-0 left-0 pointer-events-none"
            style={{
                zIndex: 0,
                width: "5000px", // Увеличиваем размеры SVG
                height: "4000px",
                minWidth: "5000px",
                minHeight: "4000px",
            }}
        >
            {connections.map((connection) =>
                renderConnection(connection.from, connection.to)
            )}
        </svg>
    );
};
