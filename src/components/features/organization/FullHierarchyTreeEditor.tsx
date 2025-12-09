import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { MAP_CONSTANTS } from "../../../constants/mapConstants";
import { useAppDispatch } from "../../../hooks/redux";
import { organizationService } from "../../../services/organizationService";
import { userService } from "../../../services/userService";
import { setPosition, setZoom } from "../../../stores/mapSlice";
import type { TreeNode } from "../../../types/organization";
import { departmentTreeUtils } from "../../../utils/departmentTreeUtils";
import { treeUtils } from "../../../utils/treeUtils";
import { ConnectionLines } from "./ConnectionLines";
import { DepartmentStructureCard } from "./DepartmentStructureCard";
import { EmployeeCard } from "./EmployeeCard";
import { PageLoader } from "../../ui/PageLoader";

const NOOP = () => {};

type ActionFeedback = {
  type: "success" | "warn" | "error" | "info";
  text: string;
};

export const FullHierarchyTreeEditor: React.FC = memo(() => {
  const dispatch = useAppDispatch();
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedSwapUserIds, setSelectedSwapUserIds] = useState<string[]>([]);
  const [swapFeedback, setSwapFeedback] = useState<ActionFeedback | null>(null);
  const [swapLoading, setSwapLoading] = useState(false);
  const [swapDepartment, setSwapDepartment] = useState<string | null>(null);
  const [moveSourceUserId, setMoveSourceUserId] = useState<string | null>(null);
  const [moveTargetManagerId, setMoveTargetManagerId] = useState<string | null>(
    null
  );
  const [moveFeedback, setMoveFeedback] = useState<ActionFeedback | null>(null);
  const [moveLoading, setMoveLoading] = useState(false);

  const nodesWithLayout = useMemo(() => {
    if (nodes.length === 0) {
      return [];
    }
    return treeUtils.calculateLayout([...nodes]);
  }, [nodes]);

  const visibleNodes = useMemo(() => {
    return treeUtils.getAllVisibleNodes(nodesWithLayout);
  }, [nodesWithLayout]);

  const loadFullHierarchy = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const hierarchy = await organizationService.getFullHierarchyTree();
      const tree = departmentTreeUtils.buildFullHierarchyTree(hierarchy);
      setNodes(tree);
    } catch (err) {
      console.error("Не удалось загрузить полное дерево иерархии", err);
      setError("Не удалось загрузить дерево подразделений");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFullHierarchy();
  }, [loadFullHierarchy]);

  useEffect(() => {
    if (!isInitialized && !loading && !error) {
      dispatch(setZoom(MAP_CONSTANTS.INITIAL_ZOOM));
      dispatch(setPosition(MAP_CONSTANTS.INITIAL_POSITION));
      setIsInitialized(true);
    }
  }, [dispatch, error, isInitialized, loading]);

  const toggleNodeById = useCallback((nodeId: string) => {
    setNodes(prev => treeUtils.toggleNodeExpansion(prev, nodeId));
  }, []);

  const handleDepartmentSelect = useCallback(
    (node: TreeNode) => {
      toggleNodeById(node.id);
    },
    [toggleNodeById]
  );

  const getNodeByUserId = useCallback(
    (userId: string): TreeNode | null => {
      const traverse = (list: TreeNode[]): TreeNode | null => {
        for (const node of list) {
          if (node.userId === userId) {
            return node;
          }
          if (node.children.length > 0) {
            const found = traverse(node.children);
            if (found) {
              return found;
            }
          }
        }
        return null;
      };

      return traverse(nodesWithLayout);
    },
    [nodesWithLayout]
  );

  const selectedEmployees = useMemo(() => {
    return selectedSwapUserIds
      .map(id => getNodeByUserId(id))
      .filter((node): node is TreeNode => Boolean(node));
  }, [getNodeByUserId, selectedSwapUserIds]);

  const moveSourceNode = useMemo(() => {
    if (!moveSourceUserId) {
      return null;
    }
    return getNodeByUserId(moveSourceUserId);
  }, [getNodeByUserId, moveSourceUserId]);

  const moveTargetNode = useMemo(() => {
    if (!moveTargetManagerId) {
      return null;
    }
    return getNodeByUserId(moveTargetManagerId);
  }, [getNodeByUserId, moveTargetManagerId]);

  const handleSwapToggle = useCallback(
    (node: TreeNode) => {
      if (node.nodeType !== "employee") {
        return;
      }

      const nodeDepartment = node.department ?? null;
      if (!nodeDepartment) {
        setSwapFeedback({
          type: "warn",
          text: "Для обмена нужен сотрудник с указанным отделом",
        });
        return;
      }

      setSelectedSwapUserIds(prevSelected => {
        if (prevSelected.includes(node.userId)) {
          const nextSelected = prevSelected.filter(id => id !== node.userId);
          if (nextSelected.length === 0) {
            setSwapDepartment(null);
          }
          return nextSelected;
        }

        if (swapDepartment && swapDepartment !== nodeDepartment) {
          setSwapFeedback({
            type: "info",
            text: `Переключаемся на отдел «${nodeDepartment}», прежний выбор сброшен`,
          });
          setSwapDepartment(nodeDepartment);
          return [node.userId];
        }

        if (prevSelected.length >= 2) {
          setSwapFeedback({
            type: "warn",
            text: "Можно выбрать максимум двух сотрудников одного отдела",
          });
          return prevSelected;
        }

        if (!swapDepartment) {
          setSwapDepartment(nodeDepartment);
        }

        setSwapFeedback(null);
        return [...prevSelected, node.userId];
      });
    },
    [swapDepartment]
  );

  const handleSwapEmployees = useCallback(async () => {
    if (selectedSwapUserIds.length !== 2) {
      setSwapFeedback({
        type: "warn",
        text: "Для обмена выберите двух сотрудников",
      });
      return;
    }

    const [firstId, secondId] = selectedSwapUserIds;
    const firstNode = getNodeByUserId(firstId);
    const secondNode = getNodeByUserId(secondId);

    if (!firstNode || !secondNode) {
      setSwapFeedback({
        type: "error",
        text: "Не удалось определить выбранных сотрудников",
      });
      return;
    }

    if (typeof secondNode.hierarchyId !== "number") {
      setSwapFeedback({
        type: "error",
        text: "Для второго сотрудника не найден hierarchyId",
      });
      return;
    }

    try {
      setSwapLoading(true);
      setSwapFeedback(null);
      await userService.moveUser({
        userId: firstNode.userId,
        targetHierarchyId: secondNode.hierarchyId,
        swapWithUserId: secondNode.userId,
      });

      await loadFullHierarchy();
      setSelectedSwapUserIds([]);
      setSwapDepartment(null);
      setSwapFeedback({
        type: "success",
        text: `${firstNode.userName} и ${secondNode.userName} успешно поменялись местами`,
      });
    } catch (swapError) {
      const message =
        swapError instanceof Error
          ? swapError.message
          : "Не удалось выполнить обмен сотрудников";
      setSwapFeedback({ type: "error", text: message });
    } finally {
      setSwapLoading(false);
    }
  }, [getNodeByUserId, loadFullHierarchy, selectedSwapUserIds]);

  const resetMoveSelection = useCallback(() => {
    setMoveSourceUserId(null);
    setMoveTargetManagerId(null);
    setMoveFeedback(null);
  }, []);

  const handleMoveSourceToggle = useCallback(
    (node: TreeNode) => {
      if (moveLoading) {
        return;
      }

      if (node.nodeType !== "employee") {
        setMoveFeedback({
          type: "warn",
          text: "Для перемещения выберите карточку сотрудника",
        });
        return;
      }

      setMoveSourceUserId(prev => {
        if (prev === node.userId) {
          setMoveTargetManagerId(null);
          setMoveFeedback(null);
          return null;
        }

        setMoveTargetManagerId(null);
        setMoveFeedback(null);
        return node.userId;
      });
    },
    [moveLoading]
  );

  const handleMoveTargetToggle = useCallback(
    (node: TreeNode) => {
      if (moveLoading) {
        return;
      }

      if (!moveSourceUserId) {
        setMoveFeedback({
          type: "warn",
          text: "Сначала выберите сотрудника для перемещения",
        });
        return;
      }

      if (node.nodeType !== "employee") {
        setMoveFeedback({
          type: "warn",
          text: "Назначить менеджером можно только сотрудника",
        });
        return;
      }

      if (node.userId === moveSourceUserId) {
        setMoveFeedback({
          type: "warn",
          text: "Нельзя назначить менеджером самого себя",
        });
        return;
      }

      if (typeof node.hierarchyId !== "number") {
        setMoveFeedback({
          type: "error",
          text: "Для выбранного менеджера не найден hierarchyId",
        });
        return;
      }

      setMoveTargetManagerId(prev => {
        const isSame = prev === node.userId;
        setMoveFeedback(null);
        return isSame ? null : node.userId;
      });
    },
    [moveLoading, moveSourceUserId]
  );

  const handleMoveEmployee = useCallback(async () => {
    if (!moveSourceNode) {
      setMoveFeedback({
        type: "warn",
        text: "Выберите сотрудника для перемещения",
      });
      return;
    }

    if (!moveTargetNode || typeof moveTargetNode.hierarchyId !== "number") {
      setMoveFeedback({
        type: "error",
        text: "Не удалось определить целевой отдел или менеджера",
      });
      return;
    }

    try {
      setMoveLoading(true);
      setMoveFeedback(null);
      await userService.moveUser({
        userId: moveSourceNode.userId,
        targetHierarchyId: moveTargetNode.hierarchyId,
        newManagerId: moveTargetNode.userId,
      });
      await loadFullHierarchy();
      resetMoveSelection();
      setMoveFeedback({
        type: "success",
        text: `${moveSourceNode.userName} теперь подчиняется ${moveTargetNode.userName}`,
      });
    } catch (moveError) {
      const message =
        moveError instanceof Error
          ? moveError.message
          : "Не удалось переместить сотрудника";
      setMoveFeedback({ type: "error", text: message });
    } finally {
      setMoveLoading(false);
    }
  }, [loadFullHierarchy, moveSourceNode, moveTargetNode, resetMoveSelection]);

  const swapReady = selectedSwapUserIds.length === 2;
  const selectionLimitReached = selectedSwapUserIds.length >= 2;
  const moveReady = Boolean(
    moveSourceNode &&
      moveTargetNode &&
      typeof moveTargetNode.hierarchyId === "number"
  );
  const moveHasSelection = Boolean(moveSourceUserId || moveTargetManagerId);

  const isSelectionDisabled = useCallback(
    (node: TreeNode): boolean => {
      if (selectedSwapUserIds.includes(node.userId)) {
        return false;
      }
      if (!selectionLimitReached) {
        return false;
      }
      if (!swapDepartment) {
        return false;
      }
      if (!node.department) {
        return true;
      }
      return node.department === swapDepartment;
    },
    [selectedSwapUserIds, selectionLimitReached, swapDepartment]
  );

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <Message severity="error" text={error} className="w-full max-w-md" />
      </div>
    );
  }

  if (nodesWithLayout.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Message
          severity="warn"
          text="Данные дерева недоступны"
          className="w-full max-w-md"
        />
      </div>
    );
  }

  return (
    <div
      className="w-full h-full relative"
      style={{
        width: `${MAP_CONSTANTS.MAP_WIDTH}px`,
        height: `${MAP_CONSTANTS.MAP_HEIGHT}px`,
        minWidth: `${MAP_CONSTANTS.MAP_WIDTH}px`,
        minHeight: `${MAP_CONSTANTS.MAP_HEIGHT}px`,
      }}
    >
      <div className="absolute top-6 left-6 z-20 w-[360px] max-w-full space-y-4 rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-2xl backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Свап сотрудников
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Выберите двух разных сотрудников. Выбранные карточки подсветятся
            зелёным, а остальные отделы временно приглушатся. Клик по сотруднику
            другого отдела сбросит предыдущий выбор и активирует новый отдел.
          </p>
        </div>

        <div className="space-y-2">
          {[0, 1].map(index => {
            const node = selectedEmployees[index];
            const label = `${index + 1}-й сотрудник`;
            return (
              <div
                key={label}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  node
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-dashed border-gray-300 text-gray-500"
                }`}
              >
                <p className="font-semibold">{label}</p>
                <p className="text-xs opacity-80">
                  {node ? `${node.userName} · ${node.position}` : "Не выбран"}
                </p>
              </div>
            );
          })}
        </div>

        {swapFeedback && (
          <Message severity={swapFeedback.type} text={swapFeedback.text} />
        )}

        <div className="border-t border-gray-100 pt-4 space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Перемещение сотрудника
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Сначала отметьте сотрудника кнопкой «Переместить», затем выберите
              нового руководителя. После этого кнопка на карточке сотрудника
              превратится в «Подтвердить», либо воспользуйтесь общей кнопкой
              ниже.
            </p>
          </div>

          <div className="space-y-2">
            <div
              className={`rounded-xl border px-3 py-2 text-sm ${
                moveSourceNode
                  ? "border-blue-200 bg-blue-50 text-blue-900"
                  : "border-dashed border-gray-300 text-gray-500"
              }`}
            >
              <p className="font-semibold">Сотрудник</p>
              <p className="text-xs opacity-80">
                {moveSourceNode
                  ? `${moveSourceNode.userName} · ${moveSourceNode.position}`
                  : "Не выбран"}
              </p>
            </div>
            <div
              className={`rounded-xl border px-3 py-2 text-sm ${
                moveTargetNode
                  ? "border-amber-200 bg-amber-50 text-amber-900"
                  : "border-dashed border-gray-300 text-gray-500"
              }`}
            >
              <p className="font-semibold">Новый менеджер</p>
              <p className="text-xs opacity-80">
                {moveTargetNode
                  ? `${moveTargetNode.userName} · ${moveTargetNode.position}`
                  : "Не выбран"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              icon="pi pi-send"
              label="Переместить"
              className="p-button-sm"
              severity="help"
              onClick={handleMoveEmployee}
              disabled={!moveReady || moveLoading}
              loading={moveLoading}
            />
            <Button
              icon="pi pi-refresh"
              label="Сбросить выбор"
              className="p-button-sm"
              severity="secondary"
              outlined
              onClick={resetMoveSelection}
              disabled={!moveHasSelection || moveLoading}
            />
          </div>

          {moveFeedback && (
            <Message severity={moveFeedback.type} text={moveFeedback.text} />
          )}
        </div>
      </div>

      <ConnectionLines nodes={nodesWithLayout} />

      {visibleNodes.map(node =>
        node.nodeType === "department" ? (
          <DepartmentStructureCard
            key={node.id}
            node={node}
            onSelectBranch={handleDepartmentSelect}
            onOpenDepartment={NOOP}
          />
        ) : (
          <EmployeeCard
            key={node.id}
            node={node}
            onToggleExpand={toggleNodeById}
            onSwapToggle={handleSwapToggle}
            isSwapCandidate={selectedSwapUserIds.includes(node.userId)}
            swapOrder={
              selectedSwapUserIds.includes(node.userId)
                ? selectedSwapUserIds.indexOf(node.userId) + 1
                : undefined
            }
            swapSelectionDisabled={isSelectionDisabled(node)}
            onSwapAction={swapReady ? handleSwapEmployees : undefined}
            showSwapAction={
              swapReady && selectedSwapUserIds.includes(node.userId)
            }
            swapActionDisabled={swapLoading}
            swapHighlight={Boolean(
              swapDepartment &&
                node.department &&
                node.department === swapDepartment
            )}
            swapEligible={
              !swapDepartment ||
              !node.department ||
              node.department === swapDepartment ||
              selectedSwapUserIds.includes(node.userId)
            }
            onMoveSourceToggle={handleMoveSourceToggle}
            onMoveTargetToggle={handleMoveTargetToggle}
            isMoveSource={moveSourceUserId === node.userId}
            isMoveTarget={moveTargetManagerId === node.userId}
            moveSourceDisabled={moveLoading}
            moveTargetDisabled={
              moveLoading ||
              !moveSourceUserId ||
              typeof node.hierarchyId !== "number"
            }
            showMoveTargetAction={Boolean(
              moveSourceUserId && node.userId !== moveSourceUserId
            )}
            moveActionDisabled={moveLoading}
            moveReady={moveReady}
            onMoveConfirm={handleMoveEmployee}
          />
        )
      )}
    </div>
  );
});
