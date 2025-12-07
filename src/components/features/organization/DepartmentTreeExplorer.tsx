import { Button } from "primereact/button";
import { Message } from "primereact/message";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MAP_CONSTANTS } from "../../../constants/mapConstants";
import { useAppDispatch } from "../../../hooks/redux";
import { organizationService } from "../../../services/organizationService";
import { setPosition, setZoom } from "../../../stores/mapSlice";
import type { DepartmentTreeNode, TreeNode } from "../../../types/organization";
import { departmentTreeUtils } from "../../../utils/departmentTreeUtils";
import { treeUtils } from "../../../utils/treeUtils";
import { ConnectionLines } from "./ConnectionLines";
import { DepartmentStructureCard } from "./DepartmentStructureCard";
import { EmployeeCard } from "./EmployeeCard";
import { PageLoader } from "../../ui/PageLoader";

type ViewMode = "structure" | "department";

type SelectedDepartment = {
  hierarchyId: number;
  title: string;
  color: string;
};

export const DepartmentTreeExplorer: React.FC = () => {
  const dispatch = useAppDispatch();
  const [viewMode, setViewMode] = useState<ViewMode>("structure");
  const [departmentTreeData, setDepartmentTreeData] =
    useState<DepartmentTreeNode | null>(null);
  const [structureNodes, setStructureNodes] = useState<TreeNode[]>([]);
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [expandedPath, setExpandedPath] = useState<number[]>([]);
  const [selectedDepartment, setSelectedDepartment] =
    useState<SelectedDepartment | null>(null);
  const [loadingStructure, setLoadingStructure] = useState(true);
  const [loadingDepartment, setLoadingDepartment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const isLoading = loadingStructure || loadingDepartment;

  const nodesWithLayout = useMemo(() => {
    if (treeNodes.length === 0) {
      return [];
    }
    return treeUtils.calculateLayout([...treeNodes]);
  }, [treeNodes]);

  const visibleNodes = useMemo(() => {
    return treeUtils.getAllVisibleNodes(nodesWithLayout);
  }, [nodesWithLayout]);

  useEffect(() => {
    const loadStructure = async () => {
      try {
        setLoadingStructure(true);
        setError(null);
        const tree = await organizationService.getDepartmentTree();
        setDepartmentTreeData(tree);
        const initialPath = tree.hierarchyId ? [tree.hierarchyId] : [];
        setExpandedPath(initialPath);
        setViewMode("structure");
        setSelectedDepartment(null);
      } catch (err) {
        console.error("Не удалось загрузить дерево департаментов", err);
        setError("Не удалось загрузить дерево департаментов");
      } finally {
        setLoadingStructure(false);
      }
    };

    loadStructure();
  }, []);

  useEffect(() => {
    if (!departmentTreeData) {
      return;
    }

    const nodes = departmentTreeUtils.buildStructureTree(
      departmentTreeData,
      expandedPath.length > 0
        ? expandedPath
        : departmentTreeData.hierarchyId
          ? [departmentTreeData.hierarchyId]
          : []
    );

    setStructureNodes(nodes);

    if (viewMode === "structure") {
      setTreeNodes(nodes);
    }
  }, [departmentTreeData, expandedPath, viewMode]);

  useEffect(() => {
    if (!isInitialized && !isLoading && !error) {
      dispatch(setZoom(MAP_CONSTANTS.INITIAL_ZOOM));
      dispatch(setPosition(MAP_CONSTANTS.INITIAL_POSITION));
      setIsInitialized(true);
    }
  }, [dispatch, error, isInitialized, isLoading]);

  const handleToggleExpand = useCallback(
    (nodeId: string) => {
      if (viewMode !== "department") {
        return;
      }

      setTreeNodes(prevNodes =>
        treeUtils.toggleNodeExpansion(prevNodes, nodeId)
      );
    },
    [viewMode]
  );

  const handleSelectBranch = useCallback((node: TreeNode) => {
    if (!node.hierarchyPath) {
      return;
    }
    setExpandedPath(node.hierarchyPath);
  }, []);

  const handleOpenDepartment = useCallback(async (node: TreeNode) => {
    if (!node.hierarchyId) {
      return;
    }

    try {
      setLoadingDepartment(true);
      setError(null);
      const response = await organizationService.getDepartmentUsers(
        node.hierarchyId
      );
      const departmentNodes = departmentTreeUtils.buildDepartmentEmployeesTree(
        response,
        node.departmentColor
      );
      setTreeNodes(departmentNodes);
      setSelectedDepartment({
        hierarchyId: node.hierarchyId,
        title: response.title,
        color: node.departmentColor,
      });
      setViewMode("department");
    } catch (err) {
      console.error("Ошибка загрузки сотрудников департамента", err);
      setError("Не удалось загрузить сотрудников отдела");
    } finally {
      setLoadingDepartment(false);
    }
  }, []);

  const handleBackToStructure = useCallback(() => {
    setTreeNodes(structureNodes);
    setSelectedDepartment(null);
    setViewMode("structure");
  }, [structureNodes]);

  if (isLoading) {
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
          text="Данные организационной структуры недоступны"
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
      <ConnectionLines nodes={nodesWithLayout} />

      {viewMode === "department" && selectedDepartment && (
        <div className="absolute top-4 left-4 z-50 flex items-center gap-3 bg-white/80 rounded-full px-3 py-2 shadow">
          <Button
            icon="pi pi-arrow-left"
            label="Назад"
            className="p-button-text p-button-sm"
            onClick={handleBackToStructure}
          />
          <span className="text-sm font-semibold text-gray-700">
            {selectedDepartment.title}
          </span>
        </div>
      )}

      {viewMode === "structure"
        ? visibleNodes.map(node => (
            <DepartmentStructureCard
              key={node.id}
              node={node}
              onSelectBranch={handleSelectBranch}
              onOpenDepartment={handleOpenDepartment}
            />
          ))
        : visibleNodes.map(node => (
            <EmployeeCard
              key={node.id}
              node={node}
              onToggleExpand={handleToggleExpand}
            />
          ))}
    </div>
  );
};
