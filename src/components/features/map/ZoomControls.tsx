import React from "react";
import { Button } from "primereact/button";

interface ZoomControlsProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
    onFitToView: () => void;
    zoom: number;
}

export const ZoomControlsComponent: React.FC<ZoomControlsProps> = ({
    onZoomIn,
    onZoomOut,
    onReset,
    onFitToView,
    zoom,
}) => {
    return (
        <div className="flex flex-col gap-2 bg-secondary p-3 rounded-lg shadow-lg border-1 surface-border">
            {/* Верхний ряд - Fit to View */}

            {/* Масштабирование */}
            <Button
                icon="pi pi-plus"
                onClick={onZoomIn}
                tooltip="Увеличить (Ctrl +)"
                tooltipOptions={{ position: "left" }}
                className="bg-primary hover:bg-primary-600 text-white border-0"
                size="small"
            />

            <div className="text-center text-sm font-medium text-gray-800 font-golos bg-white py-1 rounded border">
                {Math.round(zoom * 100)}%
            </div>

            <Button
                icon="pi pi-minus"
                onClick={onZoomOut}
                tooltip="Уменьшить (Ctrl -)"
                tooltipOptions={{ position: "left" }}
                className="bg-primary hover:bg-primary-600 text-white border-0"
                size="small"
            />

            <Button
                icon="pi pi-refresh"
                onClick={onFitToView}
                tooltip="Приблизить карту к виду по умолчанию"
                tooltipOptions={{ position: "left" }}
                className="bg-primary hover:bg-primary-600 text-white border-0"
                size="small"
            />
        </div>
    );
};
