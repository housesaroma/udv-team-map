import React, { memo, useCallback, useRef, useState } from "react";
import type { TreeNode } from "../../../types/organization";
import styles from "./DepartmentStructureCard.module.css";

interface DepartmentStructureCardProps {
  node: TreeNode;
  onSelectBranch: (node: TreeNode) => void;
  onOpenDepartment: (node: TreeNode) => void;
}

export const DepartmentStructureCard: React.FC<DepartmentStructureCardProps> =
  memo(({ node, onSelectBranch, onOpenDepartment }) => {
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const dragThreshold = 5;
    const hasChildren = node.children.length > 0;
    const iconClass = hasChildren
      ? `pi ${node.isExpanded ? "pi-chevron-down" : "pi-chevron-right"}`
      : "pi pi-arrow-right";

    const handleMouseDown = useCallback((event: React.MouseEvent) => {
      dragStartRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
      setIsDragging(false);
    }, []);

    const handleMouseMove = useCallback(
      (event: React.MouseEvent) => {
        if (isDragging) {
          return;
        }

        const deltaX = Math.abs(event.clientX - dragStartRef.current.x);
        const deltaY = Math.abs(event.clientY - dragStartRef.current.y);

        if (deltaX > dragThreshold || deltaY > dragThreshold) {
          setIsDragging(true);
        }
      },
      [isDragging]
    );

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (isDragging) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        if (hasChildren) {
          onSelectBranch(node);
        } else {
          onOpenDepartment(node);
        }
      },
      [hasChildren, isDragging, node, onOpenDepartment, onSelectBranch]
    );

    return (
      <div
        className={styles.cardContainer}
        style={{
          left: `${node.x}px`,
          top: `${node.y}px`,
          width: `${node.width}px`,
          height: `${node.height}px`,
          zIndex: node.level + 1,
        }}
      >
        <button
          type="button"
          className={styles.cardButton}
          style={{ backgroundColor: node.departmentColor }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          aria-label={node.userName}
        >
          <span className={styles.cardTitle}>{node.userName}</span>
          <span className={styles.cardChevron} aria-hidden="true">
            <i className={`${iconClass} ${styles.icon}`} />
          </span>
        </button>
      </div>
    );
  });
