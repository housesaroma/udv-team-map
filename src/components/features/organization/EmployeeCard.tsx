import { Button } from "primereact/button";
import { Card } from "primereact/card";
import React, { memo, useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { TreeNode } from "../../../types/organization";
import { getDepartmentInfo } from "../../../utils/departmentUtils";
import styles from "./EmployeeCard.module.css";
import { ROUTES } from "../../../constants/routes";

interface EmployeeCardProps {
  node: TreeNode;
  onToggleExpand: (nodeId: string) => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = memo(
  ({ node, onToggleExpand }) => {
    const navigate = useNavigate();
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const dragThreshold = 5;

    const departmentInfo = getDepartmentInfo(node.department || "");

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
        navigate(ROUTES.profile.byId(node.userId));
      },
      [isDragging, navigate, node.userId]
    );

    const handleExpandClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleExpand(node.id);
    };

    const header = (
      <div
        className="rounded-t-lg relative flex items-center justify-center"
        style={{ backgroundColor: node.departmentColor }}
      >
        <span
          className={`${styles.departmentTitle} text-white font-semibold px-2 text-center line-clamp-1`}
        >
          {departmentInfo.name}
        </span>
      </div>
    );

    const footer =
      node.children.length > 0 || node.level === 0 ? (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {node.level === 0
              ? `${node.children.length} отделов`
              : `${node.children.length} подчиненных`}
          </span>
          <Button
            icon={`pi pi-chevron-${node.isExpanded ? "down" : "up"}`}
            className="p-button-text p-button-sm transition-all"
            onClick={handleExpandClick}
            tooltip={node.isExpanded ? "Свернуть" : "Развернуть"}
            tooltipOptions={{ position: "top" }}
          />
        </div>
      ) : null;

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
          header={header}
          footer={footer}
          className={`cursor-pointer shadow-md hover:shadow-lg border-1 rounded-lg ${styles.noPaddingCard} transition-all`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onClick={handleCardClick}
        >
          <div className="flex flex-col">
            <h4 className="font-bold text-gray-800 line-clamp-2">
              {node.userName}
            </h4>
            <div className="text-left">
              <p className="text-s text-gray-500 font-medium position">
                Должность
              </p>
              <span className="inline-block bg-green-100 text-green-800 text-s px-2 py-1 rounded-full font-medium mb-4">
                {node.position}
              </span>
            </div>
          </div>
        </Card>
      </div>
    );
  }
);
