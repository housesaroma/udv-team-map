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

        // Сброс масштаба и позиции при загрузке
        useEffect(() => {
            if (!loading && !error && nodesWithLayout.length > 0) {
                dispatch(setZoom(MAP_CONSTANTS.INITIAL_ZOOM));
                dispatch(setPosition(MAP_CONSTANTS.INITIAL_POSITION));
            }
        }, [loading, error, nodesWithLayout, dispatch]);

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

                {/* Информация о количестве сотрудников */}
                <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-md z-20">
                    <div className="flex items-center space-x-2">
                        <i className="pi pi-users text-primary"></i>
                        <span className="font-golos text-sm font-medium">
                            Всего сотрудников: {hierarchy.totalEmployees}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                        <i className="pi pi-sitemap text-primary"></i>
                        <span className="font-golos text-xs text-gray-600">
                            Отображено: {visibleNodes.length} сотрудников
                        </span>
                    </div>
                </div>
            </div>
        );
    }
);
