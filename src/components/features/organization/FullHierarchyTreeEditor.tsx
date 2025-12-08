import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
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

type SwapFeedback = {
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
  const [swapFeedback, setSwapFeedback] = useState<SwapFeedback | null>(null);
  const [swapLoading, setSwapLoading] = useState(false);
  const [swapDepartment, setSwapDepartment] = useState<string | null>(null);

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

  const swapReady = selectedSwapUserIds.length === 2;
  const selectionLimitReached = selectedSwapUserIds.length >= 2;

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
          />
        )
      )}
    </div>
  );
});
