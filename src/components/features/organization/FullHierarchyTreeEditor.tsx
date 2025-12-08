import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Message } from "primereact/message";
import { MAP_CONSTANTS } from "../../../constants/mapConstants";
import { useAppDispatch } from "../../../hooks/redux";
import { organizationService } from "../../../services/organizationService";
import { setPosition, setZoom } from "../../../stores/mapSlice";
import type { TreeNode } from "../../../types/organization";
import { departmentTreeUtils } from "../../../utils/departmentTreeUtils";
import { treeUtils } from "../../../utils/treeUtils";
import { ConnectionLines } from "./ConnectionLines";
import { DepartmentStructureCard } from "./DepartmentStructureCard";
import { EmployeeCard } from "./EmployeeCard";
import { PageLoader } from "../../ui/PageLoader";

const NOOP = () => {};

export const FullHierarchyTreeEditor: React.FC = memo(() => {
  const dispatch = useAppDispatch();
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const nodesWithLayout = useMemo(() => {
    if (nodes.length === 0) {
      return [];
    }
    return treeUtils.calculateLayout([...nodes]);
  }, [nodes]);

  const visibleNodes = useMemo(() => {
    return treeUtils.getAllVisibleNodes(nodesWithLayout);
  }, [nodesWithLayout]);

  useEffect(() => {
    const loadFullHierarchy = async () => {
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
    };

    loadFullHierarchy();
  }, []);

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
          />
        )
      )}
    </div>
  );
});
