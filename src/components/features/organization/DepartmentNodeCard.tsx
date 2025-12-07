import { Button } from "primereact/button";
import { Card } from "primereact/card";
import React, { memo, useCallback, useRef, useState } from "react";
import type { TreeNode } from "../../../types/organization";
import styles from "./EmployeeCard.module.css";

interface DepartmentNodeCardProps {
  node: TreeNode;
  onToggleExpand: (nodeId: string) => void;
  onOpenDepartment: (node: TreeNode) => void;
}

export const DepartmentNodeCard: React.FC<DepartmentNodeCardProps> = memo(
  ({ node, onToggleExpand, onOpenDepartment }) => {
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const dragThreshold = 5;
    const isLeaf = node.children.length === 0;

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
      setIsDragging(false);
    }, []);

    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => {
        if (!isDragging) {
          const deltaX = Math.abs(e.clientX - dragStartRef.current.x);
          const deltaY = Math.abs(e.clientY - dragStartRef.current.y);

          if (deltaX > dragThreshold || deltaY > dragThreshold) {
            setIsDragging(true);
          }
        }
      },
      [isDragging]
    );

    const handleCardClick = useCallback(
      (e: React.MouseEvent) => {
        if (isDragging) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        if (isLeaf) {
          onOpenDepartment(node);
        }
      },
      [isDragging, isLeaf, node, onOpenDepartment]
    );

    const handleExpandClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleExpand(node.id);
    };

    const handleOpenClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onOpenDepartment(node);
    };

    const footer = (
      <div className="flex justify-between items-center gap-2">
        <span className="text-sm text-gray-500">
          {isLeaf ? "Листовой отдел" : `${node.children.length} подразделений`}
        </span>
        {isLeaf ? (
          <Button
            label="Открыть"
            icon="pi pi-arrow-right"
            className="p-button-sm"
            onClick={handleOpenClick}
          />
        ) : (
          <Button
            icon={`pi pi-chevron-${node.isExpanded ? "down" : "up"}`}
            className="p-button-text p-button-sm transition-all"
            onClick={handleExpandClick}
            tooltip={node.isExpanded ? "Свернуть" : "Развернуть"}
            tooltipOptions={{ position: "top" }}
          />
        )}
      </div>
    );

    return (
      <div
        className={styles.cardContainer}
        style={{
          position: "absolute",
          left: `${node.x}px`,
          top: `${node.y}px`,
          width: `${node.width}px`,
          height: `${node.height}px`,
          zIndex: node.level + 1,
          transition: "all 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          transformOrigin: "center center",
        }}
      >
        <Card
          header={
            <div
              className="rounded-t-lg relative flex items-center justify-center"
              style={{ backgroundColor: node.departmentColor }}
            >
              <span className="text-white font-semibold px-2 text-center line-clamp-1">
                {node.userName}
              </span>
            </div>
          }
          footer={footer}
          className={`cursor-pointer shadow-md hover:shadow-lg border-1 rounded-lg ${styles.noPaddingCard} transition-all`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onClick={handleCardClick}
        >
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs uppercase text-gray-400 tracking-wider">
                Уровень {node.level + 1}
              </p>
              <h4 className="font-bold text-gray-800 line-clamp-2">
                {node.userName}
              </h4>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Описание</p>
              <span className="inline-block bg-blue-50 text-blue-800 text-sm px-2 py-1 rounded-full font-medium">
                {isLeaf ? "Можно открыть" : "Есть подструктуры"}
              </span>
            </div>
          </div>
        </Card>
      </div>
    );
  }
);
