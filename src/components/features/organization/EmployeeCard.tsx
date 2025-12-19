import { Button } from "primereact/button";
import { Card } from "primereact/card";
import React, { memo, useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { TreeNode } from "../../../types/organization";
import { getDepartmentInfo } from "../../../utils/departmentUtils";
import styles from "./EmployeeCard.module.css";
import { ROUTES } from "../../../constants/routes";

interface EmployeeCardProps {
  /** Если true — карточка визуально приглушена и не должна реагировать на клики */
  clickDisabled?: boolean;

  node: TreeNode;
  onToggleExpand: (nodeId: string) => void;
  onSwapToggle?: (node: TreeNode) => void;
  isSwapCandidate?: boolean;
  swapOrder?: number;
  swapSelectionDisabled?: boolean;
  onSwapAction?: () => void;
  showSwapAction?: boolean;
  swapActionDisabled?: boolean;
  swapHighlight?: boolean;
  swapEligible?: boolean;
  onMoveSourceToggle?: (node: TreeNode) => void;
  onMoveTargetToggle?: (node: TreeNode) => void;
  isMoveSource?: boolean;
  isMoveTarget?: boolean;
  moveSourceDisabled?: boolean;
  moveTargetDisabled?: boolean;
  showMoveTargetAction?: boolean;
  moveActionDisabled?: boolean;
  onMoveConfirm?: () => void;
  moveReady?: boolean;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = memo(
  ({
    node,
    onToggleExpand,
    onSwapToggle,
    isSwapCandidate = false,
    swapOrder,
    swapSelectionDisabled,
    onSwapAction,
    showSwapAction = false,
    swapActionDisabled = false,
    swapHighlight = false,
    swapEligible = true,
    onMoveSourceToggle,
    onMoveTargetToggle,
    isMoveSource = false,
    isMoveTarget = false,
    moveSourceDisabled,
    moveTargetDisabled,
    showMoveTargetAction = false,
    moveActionDisabled = false,
    onMoveConfirm,
    moveReady = false,
    clickDisabled = false,
  }) => {
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
        if (clickDisabled) {
          // Когда карточка приглушена — полностью игнорируем клики
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        navigate(ROUTES.profile.byId(node.userId));
      },
      [isDragging, navigate, node.userId, clickDisabled]
    );

    const handleExpandClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleExpand(node.id);
    };

    const handleSwapToggle = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onSwapToggle) {
        onSwapToggle(node);
      }
    };

    const handleSwapActionClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onSwapAction) {
        onSwapAction();
      }
    };

    const handleMoveSourceToggleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isMoveSource && moveReady && onMoveConfirm) {
        onMoveConfirm();
        return;
      }
      if (onMoveSourceToggle) {
        onMoveSourceToggle(node);
      }
    };

    const handleMoveTargetToggleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onMoveTargetToggle) {
        onMoveTargetToggle(node);
      }
    };

    const header = (
      <div
        className="rounded-t-lg relative flex items-center justify-center"
        style={{ backgroundColor: node.departmentColor }}
      >
        {isSwapCandidate && typeof swapOrder === "number" && (
          <span className={styles.swapSelectionBadge}>{swapOrder}</span>
        )}
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

    const cardClassName = [
      "shadow-md border-1 rounded-lg",
      // При отключённой кликабельности показываем минимум интерактивности
      clickDisabled
        ? "opacity-60 cursor-not-allowed"
        : "cursor-pointer hover:shadow-lg",
      styles.noPaddingCard,
      "transition-all",
      isSwapCandidate ? styles.swapSelectedCard : "",
      swapHighlight ? styles.swapEligibleCard : "",
      !swapEligible ? styles.swapRestrictedCard : "",
      isMoveSource ? styles.moveSourceCard : "",
      isMoveTarget ? styles.moveTargetCard : "",
    ]
      .filter(Boolean)
      .join(" ");

    const swapButtonDisabled = Boolean(
      (swapSelectionDisabled && !isSwapCandidate) || clickDisabled
    );

    const moveSourceButtonDisabled = Boolean(
      (moveSourceDisabled && !isMoveSource) ||
        moveActionDisabled ||
        clickDisabled
    );

    const moveTargetButtonDisabled = Boolean(
      moveTargetDisabled || moveActionDisabled || clickDisabled
    );

    const moveSourceButtonLabel = isMoveSource
      ? moveReady
        ? "Подтвердить"
        : "Перемещаем"
      : "Переместить";

    const moveSourceButtonIcon = isMoveSource
      ? moveReady
        ? "pi pi-check"
        : "pi pi-user-edit"
      : "pi pi-arrow-right-arrow-left";

    return (
      <div
        className={`${styles.cardContainer} relative`}
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
          className={cardClassName}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onClick={handleCardClick}
        >
          <div className="flex flex-col">
            {(onSwapToggle || onMoveSourceToggle || onMoveTargetToggle) && (
              <div
                className={`${styles.cardActions} mb-3 flex flex-wrap items-center justify-end gap-2`}
              >
                {onSwapToggle && (
                  <Button
                    icon={isSwapCandidate ? "pi pi-check" : "pi pi-user-plus"}
                    label={isSwapCandidate ? "Выбрано" : "Выбрать"}
                    className="p-button-sm"
                    outlined={!isSwapCandidate}
                    severity={isSwapCandidate ? "success" : "secondary"}
                    onClick={handleSwapToggle}
                    disabled={swapButtonDisabled}
                  />
                )}
                {onSwapAction && showSwapAction && onSwapToggle && (
                  <Button
                    icon="pi pi-exchange"
                    label="Поменять"
                    className="p-button-sm"
                    severity="success"
                    onClick={handleSwapActionClick}
                    disabled={swapActionDisabled}
                    loading={swapActionDisabled}
                  />
                )}
                {onMoveSourceToggle && (
                  <Button
                    icon={moveSourceButtonIcon}
                    label={moveSourceButtonLabel}
                    className="p-button-sm"
                    severity={
                      isMoveSource
                        ? moveReady
                          ? "success"
                          : "warning"
                        : "info"
                    }
                    outlined={!(isMoveSource && moveReady)}
                    onClick={handleMoveSourceToggleClick}
                    disabled={moveSourceButtonDisabled}
                    loading={moveActionDisabled && isMoveSource}
                  />
                )}
                {onMoveTargetToggle && showMoveTargetAction && (
                  <Button
                    icon={isMoveTarget ? "pi pi-star" : "pi pi-user"}
                    label={
                      isMoveTarget ? "Менеджер выбран" : "Назначить менеджера"
                    }
                    className="p-button-sm"
                    severity={isMoveTarget ? "success" : "help"}
                    outlined={!isMoveTarget}
                    onClick={handleMoveTargetToggleClick}
                    disabled={moveTargetButtonDisabled}
                    loading={moveActionDisabled && isMoveTarget}
                  />
                )}
              </div>
            )}
            {(isMoveSource || isMoveTarget) && (
              <div className="mb-2 flex flex-wrap gap-2">
                {isMoveSource && (
                  <span
                    className={`${styles.moveBadge} ${styles.moveSourceBadge}`}
                  >
                    <i className="pi pi-user-edit" aria-hidden="true" />
                    <span>Перемещаем</span>
                  </span>
                )}
                {isMoveTarget && (
                  <span
                    className={`${styles.moveBadge} ${styles.moveTargetBadge}`}
                  >
                    <i className="pi pi-briefcase" aria-hidden="true" />
                    <span>Новый менеджер</span>
                  </span>
                )}
              </div>
            )}
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
