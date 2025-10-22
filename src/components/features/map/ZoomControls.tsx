import React from "react";
import { Button } from "primereact/button";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { setZoom } from "../../../stores/mapSlice";

const ZoomControls: React.FC = () => {
    const dispatch = useAppDispatch();
    const { zoom } = useAppSelector((state) => state.map);

    const handleZoomIn = () => {
        dispatch(setZoom(Math.min(zoom + 0.25, 5)));
    };

    const handleZoomOut = () => {
        dispatch(setZoom(Math.max(zoom - 0.25, 0.25)));
    };

    const handleReset = () => {
        dispatch(setZoom(1));
    };

    return (
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-secondary p-3 rounded-lg shadow-lg border border-gray-200">
            <Button
                icon="pi pi-plus"
                onClick={handleZoomIn}
                tooltip="Увеличить (Ctrl +)"
                tooltipOptions={{ position: "left" }}
                className="bg-primary hover:bg-primary-600 text-white border-0"
            />
            <div className="text-center text-sm font-medium text-gray-800">
                {Math.round(zoom * 100)}%
            </div>
            <Button
                icon="pi pi-minus"
                onClick={handleZoomOut}
                tooltip="Уменьшить (Ctrl -)"
                tooltipOptions={{ position: "left" }}
                className="bg-primary hover:bg-primary-600 text-white border-0"
            />
            <Button
                icon="pi pi-refresh"
                onClick={handleReset}
                className="mt-2 bg-primary hover:bg-primary-600 text-white border-0"
                tooltip="Сбросить масштаб"
                tooltipOptions={{ position: "left" }}
            />
        </div>
    );
};

export default ZoomControls;
