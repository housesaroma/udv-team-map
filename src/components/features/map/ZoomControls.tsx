import { Button } from "primereact/button";
import React from "react";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToView: () => void;
  zoom: number;
  minZoom: number;
  maxZoom: number;
}

export const ZoomControlsComponent: React.FC<ZoomControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onFitToView,
  zoom,
  minZoom,
  maxZoom,
}) => {
  const isZoomOutDisabled = zoom <= minZoom;
  const isZoomInDisabled = zoom >= maxZoom;

  return (
    <div
      className="flex items-center gap-2 bg-secondary p-2 rounded-lg shadow-lg border-1 surface-border"
      data-tour="zoom-controls"
    >
      {/* Кнопка уменьшения */}
      <Button
        icon="pi pi-minus"
        onClick={onZoomOut}
        tooltip={
          isZoomOutDisabled
            ? "Минимальный масштаб достигнут"
            : "Уменьшить (Ctrl -)"
        }
        tooltipOptions={{ position: "top" }}
        className={`text-primary hover:bg-primary/10 border-0 focus:shadow-none ${
          isZoomOutDisabled ? "opacity-40 cursor-not-allowed" : ""
        }`}
        size="small"
        text
        disabled={isZoomOutDisabled}
      />

      {/* Отображение процентов */}
      <div className="text-center text-sm font-medium text-primary font-golos bg-secondary py-1 px-2 rounded border min-w-[60px]">
        {Math.round(zoom * 100)}%
      </div>

      {/* Кнопка увеличения */}
      <Button
        icon="pi pi-plus"
        onClick={onZoomIn}
        tooltip={
          isZoomInDisabled
            ? "Максимальный масштаб достигнут"
            : "Увеличить (Ctrl +)"
        }
        tooltipOptions={{ position: "top" }}
        className={`text-primary hover:bg-primary/10 border-0 focus:shadow-none ${
          isZoomInDisabled ? "opacity-40 cursor-not-allowed" : ""
        }`}
        size="small"
        text
        disabled={isZoomInDisabled}
      />

      {/* Кнопка сброса */}
      <Button
        icon="pi pi-refresh"
        onClick={onFitToView}
        tooltip="Сбросить масштаб"
        tooltipOptions={{ position: "top" }}
        className="text-primary hover:bg-primary/10 border-0 focus:shadow-none"
        size="small"
        text
      />
    </div>
  );
};
