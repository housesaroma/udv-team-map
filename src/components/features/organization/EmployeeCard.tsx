import React, { useRef, useState, useCallback } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import type { TreeNode } from "../../../types/organization";
import styles from "./EmployeeCard.module.css";

interface EmployeeCardProps {
    node: TreeNode;
    onToggleExpand: (nodeId: string) => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
    node,
    onToggleExpand,
}) => {
    const navigate = useNavigate();
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const dragThreshold = 5; // Порог перемещения в пикселях

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // Сохраняем начальные координаты
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
        };
        setIsDragging(false);
    }, []);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            // Проверяем, превысили ли порог перемещения
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
            // Если было перемещение - не открываем профиль
            if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            // Открываем профиль только если не было перемещения
            navigate(`/profile/${node.userId}`);
        },
        [isDragging, navigate, node.userId]
    );

    const handleExpandClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleExpand(node.id);
    };

    const header = (
        <div
            className="h-3 rounded-t-lg"
            style={{ backgroundColor: node.departmentColor }}
        />
    );

    const footer =
        node.children.length > 0 ? (
            <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                    {node.children.length} подчиненных
                </span>
                <Button
                    icon={`pi pi-chevron-${node.isExpanded ? "down" : "up"}`}
                    className="p-button-text p-button-sm"
                    onClick={handleExpandClick}
                    tooltip={node.isExpanded ? "Свернуть" : "Развернуть"}
                    tooltipOptions={{ position: "top" }}
                />
            </div>
        ) : null;

    return (
        <Card
            header={header}
            footer={footer}
            className={`cursor-pointer shadow-md hover:shadow-lg transition-all duration-200 border-1 ${styles.noPaddingCard}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onClick={handleCardClick}
            style={{
                width: "280px",
                minHeight: "120px",
            }}
        >
            <div className="flex flex-col space-y-2">
                <div className="text-center">
                    <h4 className="font-bold text-gray-800 line-clamp-2">
                        {node.userName}
                    </h4>
                    <p className="text-s text-gray-600 line-clamp-2">
                        {node.position}
                    </p>
                </div>
            </div>
        </Card>
    );
};
