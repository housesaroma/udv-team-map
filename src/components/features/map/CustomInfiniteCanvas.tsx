import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { useKeyboardShortcuts } from "../../../hooks/useKeyboardShortcuts";
import { setPosition, setZoom } from "../../../stores/mapSlice";
import { OrganizationTree } from "../organization/OrganizationTree";
import { SvgDotPattern } from "./SvgDotPattern";
import { ZoomControlsComponent } from "./ZoomControls";

const CustomCanvas: React.FC = () => {
    const dispatch = useAppDispatch();
    const { zoom, position } = useAppSelector((state) => state.map);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isAnimating, setIsAnimating] = useState(false);

    // Используем ref для позиции чтобы избежать замыканий
    const positionRef = useRef(position);
    const zoomRef = useRef(zoom);
    const animationFrameRef = useRef<number>(0);

    // Синхронизируем ref с актуальными значениями
    useEffect(() => {
        positionRef.current = position;
        zoomRef.current = zoom;
    }, [position, zoom]);

    // Используем хук горячих клавиш
    useKeyboardShortcuts();

    // Нативный обработчик колесика
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
                e.stopPropagation();

                const delta = -e.deltaY * 0.0025;
                const newZoom = Math.min(Math.max(zoom + delta, 0.25), 5);
                dispatch(setZoom(newZoom));
            }
        };

        container.addEventListener("wheel", handleWheel, { passive: false });
        return () => container.removeEventListener("wheel", handleWheel);
    }, [zoom, dispatch]);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.button !== 0 || isAnimating) return;
            setIsDragging(true);
            setDragStart({
                x: e.clientX - positionRef.current.x,
                y: e.clientY - positionRef.current.y,
            });
            const target = e.currentTarget as HTMLDivElement;
            target.style.cursor = "grabbing";

            // Отменяем предыдущий анимационный фрейм если есть
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        },
        [isAnimating]
    );

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!isDragging || isAnimating) return;

            // Используем один requestAnimationFrame на кадр
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            animationFrameRef.current = requestAnimationFrame(() => {
                const newX = e.clientX - dragStart.x;
                const newY = e.clientY - dragStart.y;
                dispatch(setPosition({ x: newX, y: newY }));
            });
        },
        [isDragging, dragStart, dispatch, isAnimating]
    );

    const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(false);
        const target = e.currentTarget as HTMLDivElement;
        target.style.cursor = "grab";

        // Отменяем анимационный фрейм при отпускании
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    }, []);

    const handleMouseLeave = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            setIsDragging(false);
            const target = e.currentTarget as HTMLDivElement;
            target.style.cursor = "grab";

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        },
        []
    );

    // Функция плавной анимации
    const animateTo = useCallback(
        (targetZoom: number, targetPosition: { x: number; y: number }) => {
            setIsAnimating(true);

            const startZoom = zoomRef.current;
            const startPosition = { ...positionRef.current };
            const startTime = performance.now();
            const duration = 500; // 600ms для плавной анимации

            const animate = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Кубическая easing функция для плавного ускорения и замедления
                const easeProgress =
                    progress < 0.5
                        ? 4 * progress * progress * progress
                        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

                // Интерполируем значения
                const newZoom =
                    startZoom + (targetZoom - startZoom) * easeProgress;
                const newX =
                    startPosition.x +
                    (targetPosition.x - startPosition.x) * easeProgress;
                const newY =
                    startPosition.y +
                    (targetPosition.y - startPosition.y) * easeProgress;

                // Обновляем состояние
                dispatch(setZoom(newZoom));
                dispatch(setPosition({ x: newX, y: newY }));

                if (progress < 1) {
                    animationFrameRef.current = requestAnimationFrame(animate);
                } else {
                    // Анимация завершена
                    setIsAnimating(false);
                    // Убедимся, что финальные значения точные
                    dispatch(setZoom(targetZoom));
                    dispatch(setPosition(targetPosition));
                }
            };

            animationFrameRef.current = requestAnimationFrame(animate);
        },
        [dispatch]
    );

    const handleFitToView = useCallback(() => {
        // Отменяем текущую анимацию если есть
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        // Анимируем к исходному состоянию
        animateTo(1, { x: 0, y: 0 });
    }, [animateTo]);

    const handleZoomIn = useCallback(() => {
        if (isAnimating) return;
        const newZoom = Math.min(zoom + 0.25, 5);
        dispatch(setZoom(newZoom));
    }, [zoom, dispatch, isAnimating]);

    const handleZoomOut = useCallback(() => {
        if (isAnimating) return;
        const newZoom = Math.max(zoom - 0.25, 0.25);
        dispatch(setZoom(newZoom));
    }, [zoom, dispatch, isAnimating]);

    // Очистка при размонтировании
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return (
        <div className="w-full h-full bg-primary relative overflow-hidden">
            {/* Компонент управления zoom и Fit to View */}
            <div className="absolute bottom-4 right-4 z-10">
                <ZoomControlsComponent
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onFitToView={handleFitToView}
                    zoom={zoom}
                />
            </div>

            {/* Canvas контейнер */}
            <div
                ref={containerRef}
                className="w-full h-full cursor-grab bg-primary"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                style={{
                    userSelect: "none",
                    touchAction: "none",
                    transform: "translateZ(0)",
                    willChange: "transform",
                    cursor: isAnimating
                        ? "wait"
                        : isDragging
                        ? "grabbing"
                        : "grab",
                }}
                role="application"
                aria-label="Интерактивная карта организационной структуры"
            >
                {/* Паттерн точек на фоне */}
                <SvgDotPattern position={position} />

                {/* Организационное дерево */}
                <OrganizationTree />
            </div>
        </div>
    );
};

export default CustomCanvas;
