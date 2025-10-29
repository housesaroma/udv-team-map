import { Message } from "primereact/message";
import React, { useCallback, useEffect, useState, useMemo, memo } from "react";
import { useAppDispatch } from "../../../hooks/redux";
import { organizationService } from "../../../services/organizationService";
import { setPosition, setZoom } from "../../../stores/mapSlice";
import type {
    OrganizationHierarchy,
    TreeNode,
} from "../../../types/organization";
import { treeUtils } from "../../../utils/treeUtils";
import { EmployeeCard } from "./EmployeeCard";
import { ConnectionLines } from "./ConnectionLines";
import { PageLoader } from "../../ui/PageLoader";
import { MAP_CONSTANTS } from "../../../constants/mapConstants";

interface OrganizationTreeProps {
    className?: string;
}

export const OrganizationTree: React.FC<OrganizationTreeProps> = memo(
    ({ className = "" }) => {
        const dispatch = useAppDispatch();
        const [isInitialized, setIsInitialized] = useState(false);

        const [hierarchy, setHierarchy] =
            useState<OrganizationHierarchy | null>(null);
        const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

        // Мемоизируем layout узлов - ВАЖНО: используем calculateLayout для получения позиций
        const nodesWithLayout = useMemo(() => {
            if (treeNodes.length === 0) return [];
            return treeUtils.calculateLayout([...treeNodes]); // создаем копию чтобы избежать мутаций
        }, [treeNodes]);

        // Мемоизируем видимые узлы из nodesWithLayout
        const visibleNodes = useMemo(() => {
            return treeUtils.getAllVisibleNodes(nodesWithLayout);
        }, [nodesWithLayout]);

        // Загрузка данных
        useEffect(() => {
            const loadHierarchy = async () => {
                try {
                    setLoading(true);
                    setError(null);

                    const data =
                        await organizationService.getOrganizationHierarchy();
                    setHierarchy(data);

                    const allNodes = treeUtils.buildTreeFromHierarchy(data);
                    setTreeNodes(allNodes);
                } catch (err) {
                    console.error(
                        "Ошибка загрузки организационной структуры:",
                        err
                    );
                    setError("Не удалось загрузить организационную структуру");
                } finally {
                    setLoading(false);
                }
            };

            loadHierarchy();
        }, []);

        // Обработчик сворачивания/разворачивания узлов
        const handleToggleExpand = useCallback((nodeId: string) => {
            setTreeNodes((prevNodes) => {
                const updatedNodes = treeUtils.toggleNodeExpansion(
                    prevNodes,
                    nodeId
                );
                return updatedNodes; // Layout будет пересчитан в useMemo
            });
        }, []);

        useEffect(() => {
            if (!isInitialized && !loading && !error) {
                dispatch(setZoom(MAP_CONSTANTS.INITIAL_ZOOM));
                dispatch(setPosition(MAP_CONSTANTS.INITIAL_POSITION));
                setIsInitialized(true);
            }
        }, [loading, error, isInitialized, dispatch]);

        if (loading) {
            return <PageLoader />;
        }

        if (error) {
            return (
                <div className="flex items-center justify-center h-full">
                    <Message
                        severity="error"
                        text={error}
                        className="w-full max-w-md"
                    />
                </div>
            );
        }

        if (!hierarchy || nodesWithLayout.length === 0) {
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
                className={`w-full h-full relative ${className}`}
                style={{
                    width: "10000px",
                    height: "4000px",
                    minWidth: "10000px",
                    minHeight: "4000px",
                }}
            >
                {/* Соединительные линии */}
                <ConnectionLines nodes={nodesWithLayout} />

                {/* Карточки сотрудников - рендерим из nodesWithLayout */}
                {visibleNodes.map((node) => (
                    <EmployeeCard
                        key={node.id}
                        node={node}
                        onToggleExpand={handleToggleExpand}
                    />
                ))}
            </div>
        );
    }
);
