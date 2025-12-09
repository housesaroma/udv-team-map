import React, { memo, useCallback, useRef, useState } from "react";
import type { TreeNode } from "../../../types/organization";
import styles from "./DepartmentStructureCard.module.css";

interface DepartmentStructureCardProps {
  node: TreeNode;
  onSelectBranch: (node: TreeNode) => void;
  onOpenDepartment: (node: TreeNode) => void;
  isStatic?: boolean;
  onAssignMoveTarget?: (node: TreeNode) => void;
  showMoveTargetAction?: boolean;
  moveTargetActionDisabled?: boolean;
  isMoveTargetDepartment?: boolean;
}

export const DepartmentStructureCard: React.FC<DepartmentStructureCardProps> =
  memo(
    ({
      node,
      onSelectBranch,
      onOpenDepartment,
      isStatic = false,
      onAssignMoveTarget,
      showMoveTargetAction = false,
      moveTargetActionDisabled = false,
      isMoveTargetDepartment = false,
    }) => {
      const [isDragging, setIsDragging] = useState(false);
      const dragStartRef = useRef({ x: 0, y: 0 });
      const dragThreshold = 5;
      const hasChildren = node.children.length > 0;
      const iconClass = hasChildren
        ? `pi ${node.isExpanded ? "pi-chevron-down" : "pi-chevron-right"}`
        : "pi pi-arrow-right";
      const iconWrapperClassName = `${styles.cardChevron} ${
        hasChildren ? styles.cardChevronMinimal : styles.cardChevronAction
      }`;
      const iconClassName = `${iconClass} ${styles.icon} ${
        hasChildren ? styles.iconMuted : styles.iconAction
      }`;

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
          if (isStatic) {
            event.preventDefault();
            return;
          }

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
        [
          hasChildren,
          isDragging,
          isStatic,
          node,
          onOpenDepartment,
          onSelectBranch,
        ]
      );

      const handleAssignMoveTarget = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
          if (!onAssignMoveTarget || moveTargetActionDisabled) {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          onAssignMoveTarget(node);
        },
        [moveTargetActionDisabled, node, onAssignMoveTarget]
      );

      return (
        <div
          className={`${styles.cardContainer} ${
            isMoveTargetDepartment ? styles.moveTargetSelected : ""
          }`}
          style={{
            left: `${node.x}px`,
            top: `${node.y}px`,
            width: `${node.width}px`,
            height: `${node.height}px`,
            zIndex: node.level + 1,
          }}
        >
          {!isStatic && showMoveTargetAction && (
            <button
              type="button"
              className={`${styles.moveAssignButton} ${
                isMoveTargetDepartment ? styles.moveAssignButtonActive : ""
              }`}
              onClick={handleAssignMoveTarget}
              disabled={moveTargetActionDisabled}
            >
              {isMoveTargetDepartment ? "Выбрано" : "Назначить"}
            </button>
          )}
          <button
            type="button"
            className={styles.cardButton}
            style={{ backgroundColor: node.departmentColor }}
            onMouseDown={isStatic ? undefined : handleMouseDown}
            onMouseMove={isStatic ? undefined : handleMouseMove}
            onClick={isStatic ? undefined : handleClick}
            disabled={isStatic}
            aria-disabled={isStatic}
            aria-label={node.userName}
          >
            <span className={styles.cardTitle}>{node.userName}</span>
            {!isStatic && (
              <span className={iconWrapperClassName} aria-hidden="true">
                <i className={iconClassName} />
              </span>
            )}
          </button>
        </div>
      );
    }
  );
