import React, { memo, useMemo } from "react";
import type { TreeNode } from "../../../types/organization";

interface ConnectionLinesProps {
  nodes: TreeNode[];
}

// Мемоизируем компонент линий
export const ConnectionLines: React.FC<ConnectionLinesProps> = memo(
  ({ nodes }) => {
    const connections = useMemo(() => {
      const getConnections = (): Array<{
        from: { x: number; y: number };
        to: { x: number; y: number };
        id: string;
      }> => {
        const connections: Array<{
          from: { x: number; y: number };
          to: { x: number; y: number };
          id: string;
        }> = [];

        const traverse = (nodeList: TreeNode[]) => {
          for (const node of nodeList) {
            if (node.isExpanded && node.children.length > 0) {
              for (const child of node.children) {
                connections.push({
                  from: {
                    x: node.x + node.width / 2,
                    y: node.y + node.height,
                  },
                  to: {
                    x: child.x + child.width / 2,
                    y: child.y,
                  },
                  id: `${node.id}-${child.id}`,
                });
              }
              traverse(node.children);
            }
          }
        };

        traverse(nodes);
        return connections;
      };

      return getConnections();
    }, [nodes]);

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
          className="connection-line"
          style={{
            transition: "all 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
      );
    };

    return (
      <svg
        className="absolute top-0 left-0 pointer-events-none"
        style={{
          zIndex: 0,
          width: "10000px",
          height: "4000px",
        }}
      >
        {connections.map(connection =>
          renderConnection(connection.from, connection.to, connection.id)
        )}
      </svg>
    );
  }
);
