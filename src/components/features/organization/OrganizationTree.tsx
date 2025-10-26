import { Message } from "primereact/message";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
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

interface OrganizationTreeProps {
    className?: string;
}

export const OrganizationTree: React.FC<OrganizationTreeProps> = ({
    className = "",
}) => {
    const dispatch = useAppDispatch();
    const { zoom, position } = useAppSelector((state) => state.map);

    const [hierarchy, setHierarchy] = useState<OrganizationHierarchy | null>(
        null
    );
    const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Мемоизируем видимые узлы чтобы избежать лишних пересчетов
    const visibleNodes = useMemo(() => {
        return treeUtils.getAllVisibleNodes(treeNodes);
    }, [treeNodes]);

    // Загрузка данных - только один раз при монтировании
    useEffect(() => {
        const loadHierarchy = async () => {
            try {
                setLoading(true);
                setError(null);

                const data =
                    await organizationService.getOrganizationHierarchy();
                setHierarchy(data);

                const allNodes = treeUtils.buildTreeFromHierarchy(data);
                const nodesWithLayout = treeUtils.calculateLayout(allNodes);

                setTreeNodes(nodesWithLayout);
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

    // Обработчик сворачивания/разворачивания узлов - оптимизированный
    const handleToggleExpand = useCallback((nodeId: string) => {
        setTreeNodes((prevNodes) => {
            const updatedNodes = treeUtils.toggleNodeExpansion(
                prevNodes,
                nodeId
            );
            return treeUtils.calculateLayout(updatedNodes);
        });
    }, []);

    // Сброс масштаба и позиции при загрузке - только один раз
    useEffect(() => {
        if (!loading && !error) {
            dispatch(setZoom(1));
            dispatch(setPosition({ x: -1500, y: 0 }));
        }
    }, [loading, error, dispatch]);

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

    if (!hierarchy) {
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
                minWidth: "5000px", // Увеличиваем минимальную ширину
                minHeight: "4000px", // Увеличиваем минимальную высоту
                width: "5000px", // Явно задаем ширину
                height: "4000px", // Явно задаем высоту
            }}
        >
            {/* Общий контейнер для линий и карточек с трансформацией */}
            <div
                className="absolute top-0 left-0"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                    transformOrigin: "center center",
                    width: "5000px", // Увеличиваем размеры контейнера
                    height: "4000px", // чтобы вместить все дерево
                    minWidth: "5000px",
                    minHeight: "4000px",
                }}
            >
                {/* Соединительные линии - рендерим ПОД карточками */}
                <ConnectionLines nodes={treeNodes} />

                {/* Карточки сотрудников */}
                {visibleNodes.map((node) => (
                    <div
                        key={node.id}
                        className="absolute transition-all duration-300"
                        style={{
                            left: `${node.x}px`,
                            top: `${node.y}px`,
                            width: `${node.width}px`,
                            height: `${node.height}px`,
                            zIndex: node.level + 1,
                            transition:
                                "all 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                            willChange: "transform",
                        }}
                    >
                        <EmployeeCard
                            node={node}
                            onToggleExpand={handleToggleExpand}
                        />
                    </div>
                ))}
            </div>

            {/* Информация о количестве сотрудников */}
            <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-md z-20 mt-20">
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
};
