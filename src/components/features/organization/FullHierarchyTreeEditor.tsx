import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Toast } from "primereact/toast";
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
import TOAST_MESSAGES from "../../../constants/toastMessages";

const NOOP = () => {};

type ActionFeedback = {
  type: "success" | "warn" | "error" | "info";
  text: string;
};

export const FullHierarchyTreeEditor: React.FC = memo(() => {
  const dispatch = useAppDispatch();
  const toastRef = useRef<Toast | null>(null);
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
  const [moveTargetHierarchyId, setMoveTargetHierarchyId] = useState<
    number | null
  >(null);
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

  const getNodeByHierarchyId = useCallback(
    (hierarchyId: number): TreeNode | null => {
      const traverse = (list: TreeNode[]): TreeNode | null => {
        for (const node of list) {
          if (node.hierarchyId === hierarchyId) {
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

  const moveTargetManagerNode = useMemo(() => {
    if (!moveTargetManagerId) {
      return null;
    }
    return getNodeByUserId(moveTargetManagerId);
  }, [getNodeByUserId, moveTargetManagerId]);

  const moveTargetDepartmentNode = useMemo(() => {
    if (typeof moveTargetHierarchyId !== "number") {
      return null;
    }
    return getNodeByHierarchyId(moveTargetHierarchyId);
  }, [getNodeByHierarchyId, moveTargetHierarchyId]);

  const handleSwapToggle = useCallback(
    (node: TreeNode) => {
      // Prevent starting swap when a move selection exists
      if (moveSourceUserId) {
        setSwapFeedback({
          type: "warn",
          text: "Сначала отмените выбор для перемещения",
        });
        return;
      }

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
    [swapDepartment, moveSourceUserId]
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
      const rawMessage = parseServerErrorMessage(swapError);
      const normalized = normalizeMoveErrorMessage(rawMessage);
      setSwapFeedback({ type: "error", text: normalized });
      if (toastRef.current) {
        console.info("Showing swap error toast:", normalized);
        toastRef.current.show({
          severity: "error",
          summary: TOAST_MESSAGES.swapRejectedSummary,
          detail: normalized,
          life: 5000,
        });
      } else {
        console.warn(
          "Toast ref is null — swap error toast not shown:",
          normalized
        );
      }
    } finally {
      setSwapLoading(false);
    }
  }, [getNodeByUserId, loadFullHierarchy, selectedSwapUserIds]);

  const resetMoveSelection = useCallback(() => {
    setMoveSourceUserId(null);
    setMoveTargetManagerId(null);
    setMoveTargetHierarchyId(null);
    setMoveFeedback(null);
  }, []);

  const normalizeMoveErrorMessage = useCallback((text: string) => {
    if (text.includes("Cannot move CEO user with subordinates")) {
      return TOAST_MESSAGES.moveDeniedCEO;
    }
    return text;
  }, []);

  const parseServerErrorMessage = useCallback((error: unknown) => {
    // Извлекаем полезный текст ошибки из разных форматов
    const raw = error instanceof Error ? error.message : String(error);

    // Если это JSON внутри строки, попытаемся распарсить
    const jsonStart = raw.indexOf("{");
    if (jsonStart !== -1) {
      const jsonText = raw.slice(jsonStart);
      try {
        const parsed = JSON.parse(jsonText);
        // Если есть поле message
        if (parsed && typeof parsed === "object") {
          if (parsed.message && typeof parsed.message === "string") {
            return String(parsed.message);
          }
          // Если есть validation errors
          if (parsed.errors && typeof parsed.errors === "object") {
            // Собираем текст всех ошибок
            const details: string[] = [];
            for (const [k, v] of Object.entries(parsed.errors)) {
              if (Array.isArray(v)) {
                details.push(`${k}: ${v.join(", ")}`);
              } else {
                details.push(`${k}: ${String(v)}`);
              }
            }
            return details.join("; ");
          }
        }
      } catch {
        // ignore parse error
      }
    }

    return raw;
  }, []);

  const handleMoveSourceToggle = useCallback(
    (node: TreeNode) => {
      // Prevent starting move when swap selection exists
      if (selectedSwapUserIds.length > 0) {
        setMoveFeedback({
          type: "warn",
          text: "Сначала отмените выбор для обмена",
        });
        return;
      }

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
          setMoveTargetHierarchyId(null);
          setMoveFeedback(null);
          return null;
        }

        setMoveTargetManagerId(null);
        setMoveTargetHierarchyId(null);
        setMoveFeedback(null);
        return node.userId;
      });
    },
    [moveLoading, selectedSwapUserIds]
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
        if (isSame) {
          setMoveTargetHierarchyId(null);
          return null;
        }

        setMoveTargetHierarchyId(node.hierarchyId ?? null);
        return node.userId;
      });
    },
    [moveLoading, moveSourceUserId]
  );

  const handleMoveDepartmentTarget = useCallback(
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

      if (node.nodeType !== "department") {
        return;
      }

      const hasDirectEmployees = node.children.some(
        child => child.nodeType === "employee"
      );
      const hasChildDepartments = node.children.some(
        child => child.nodeType === "department"
      );

      if (hasChildDepartments) {
        setMoveFeedback({
          type: "warn",
          text: "Назначить сотрудника можно только в конечный отдел",
        });
        return;
      }

      if (hasDirectEmployees) {
        setMoveFeedback({
          type: "warn",
          text: "В отделе уже есть руководитель или сотрудники, выберите менеджера",
        });
        return;
      }

      if (typeof node.hierarchyId !== "number") {
        setMoveFeedback({
          type: "error",
          text: "Для выбранного отдела не найден hierarchyId",
        });
        return;
      }

      const isSameDepartment =
        moveTargetHierarchyId === node.hierarchyId && !moveTargetManagerId;

      if (isSameDepartment) {
        setMoveTargetHierarchyId(null);
        setMoveFeedback(null);
        return;
      }

      setMoveTargetManagerId(null);
      setMoveTargetHierarchyId(node.hierarchyId);
      setMoveFeedback(null);
    },
    [moveLoading, moveSourceUserId, moveTargetHierarchyId, moveTargetManagerId]
  );

  const handleMoveEmployee = useCallback(async () => {
    if (!moveSourceNode) {
      setMoveFeedback({
        type: "warn",
        text: "Выберите сотрудника для перемещения",
      });
      return;
    }

    if (typeof moveTargetHierarchyId !== "number") {
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
        targetHierarchyId: moveTargetHierarchyId,
        newManagerId: moveTargetManagerNode?.userId || undefined,
      });
      await loadFullHierarchy();
      resetMoveSelection();
      const successText = moveTargetManagerNode
        ? `${moveSourceNode.userName} теперь подчиняется ${moveTargetManagerNode.userName}`
        : `${moveSourceNode.userName} назначен(а) руководителем отдела ${moveTargetDepartmentNode?.userName ?? ""}`;
      setMoveFeedback({
        type: "success",
        text: successText,
      });
    } catch (moveError) {
      const rawMessage = parseServerErrorMessage(moveError);
      const normalizedMessage = normalizeMoveErrorMessage(rawMessage);
      setMoveFeedback({ type: "error", text: normalizedMessage });
      if (toastRef.current) {
        console.info("Showing move error toast:", normalizedMessage);
        toastRef.current.show({
          severity: "error",
          summary: TOAST_MESSAGES.moveRejectedSummary,
          detail: normalizedMessage,
          life: 5000,
        });
      } else {
        console.warn(
          "Toast ref is null — move error toast not shown:",
          normalizedMessage
        );
      }
    } finally {
      setMoveLoading(false);
    }
  }, [
    loadFullHierarchy,
    moveSourceNode,
    moveTargetDepartmentNode,
    moveTargetHierarchyId,
    moveTargetManagerNode,
    normalizeMoveErrorMessage,
    resetMoveSelection,
  ]);

  const swapReady = selectedSwapUserIds.length === 2;
  const selectionLimitReached = selectedSwapUserIds.length >= 2;
  const moveReady = Boolean(
    moveSourceNode && typeof moveTargetHierarchyId === "number"
  );
  const moveHasSelection = Boolean(
    moveSourceUserId ||
      moveTargetManagerId ||
      typeof moveTargetHierarchyId === "number"
  );

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
      <Toast
        ref={toastRef}
        position="top-right"
        baseZIndex={100000}
        appendTo={typeof document !== "undefined" ? document.body : undefined}
      />
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
              ниже. Чтобы назначить сотрудника главой пустого отдела, нажмите
              «Назначить» на карточке отдела без сотрудников.
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
                moveTargetDepartmentNode
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-dashed border-gray-300 text-gray-500"
              }`}
            >
              <p className="font-semibold">Новый отдел</p>
              <p className="text-xs opacity-80">
                {moveTargetDepartmentNode
                  ? moveTargetDepartmentNode.userName
                  : "Не выбран"}
              </p>
            </div>
            <div
              className={`rounded-xl border px-3 py-2 text-sm ${
                moveTargetManagerNode
                  ? "border-amber-200 bg-amber-50 text-amber-900"
                  : "border-dashed border-gray-300 text-gray-500"
              }`}
            >
              <p className="font-semibold">Новый менеджер (опционально)</p>
              <p className="text-xs opacity-80">
                {moveTargetManagerNode
                  ? `${moveTargetManagerNode.userName} · ${moveTargetManagerNode.position}`
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

      {visibleNodes.map(node => {
        if (node.nodeType === "department") {
          const hasDirectEmployees = node.children.some(
            child => child.nodeType === "employee"
          );
          const hasChildDepartments = node.children.some(
            child => child.nodeType === "department"
          );
          const canSelectDepartmentTarget = Boolean(
            moveSourceUserId &&
              typeof node.hierarchyId === "number" &&
              !hasDirectEmployees &&
              !hasChildDepartments
          );
          const isDepartmentTargetSelected = Boolean(
            typeof node.hierarchyId === "number" &&
              moveTargetHierarchyId === node.hierarchyId &&
              !moveTargetManagerId
          );

          return (
            <DepartmentStructureCard
              key={node.id}
              node={node}
              onSelectBranch={handleDepartmentSelect}
              onOpenDepartment={NOOP}
              onAssignMoveTarget={handleMoveDepartmentTarget}
              showMoveTargetAction={canSelectDepartmentTarget}
              moveTargetActionDisabled={moveLoading}
              isMoveTargetDepartment={isDepartmentTargetSelected}
            />
          );
        }

        return (
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
            swapSelectionDisabled={
              isSelectionDisabled(node) || Boolean(moveSourceUserId)
            }
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
            // Если выбран отдел для свапа и узел не в этом отделе и не выбран — приглушаем и делаем некликабельным
            clickDisabled={Boolean(
              swapDepartment &&
                !selectedSwapUserIds.includes(node.userId) &&
                (!node.department || node.department !== swapDepartment)
            )}
            onMoveSourceToggle={handleMoveSourceToggle}
            onMoveTargetToggle={handleMoveTargetToggle}
            isMoveSource={moveSourceUserId === node.userId}
            isMoveTarget={moveTargetManagerId === node.userId}
            moveSourceDisabled={moveLoading || selectedSwapUserIds.length > 0}
            moveTargetDisabled={
              moveLoading ||
              selectedSwapUserIds.length > 0 ||
              !moveSourceUserId ||
              typeof node.hierarchyId !== "number"
            }
            showMoveTargetAction={Boolean(
              moveSourceUserId &&
                node.userId !== moveSourceUserId &&
                typeof node.hierarchyId === "number"
            )}
            moveActionDisabled={moveLoading}
            moveReady={moveReady}
            onMoveConfirm={handleMoveEmployee}
          />
        );
      })}
    </div>
  );
});
