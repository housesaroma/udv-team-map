import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { useKeyboardShortcuts } from "../../../hooks/useKeyboardShortcuts";
import { setPosition, setZoom } from "../../../stores/mapSlice";
import { OrganizationTree } from "../organization/OrganizationTree";
import { SvgDotPattern } from "./SvgDotPattern";
import { ZoomControlsComponent } from "./ZoomControls";
import { MAP_CONSTANTS } from "../../../constants/mapConstants";

const CustomCanvas: React.FC = () => {
    const dispatch = useAppDispatch();
    const { zoom, position } = useAppSelector((state) => state.map);
    const containerRef = useRef<HTMLDivElement>(null);
    const transformContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isAnimating, setIsAnimating] = useState(false);

    const positionRef = useRef(position);
    const zoomRef = useRef(zoom);
    const animationFrameRef = useRef<number>(0);

    // Синхронизируем ref с актуальными значениями
    useEffect(() => {
        positionRef.current = position;
        zoomRef.current = zoom;
    }, [position, zoom]);

    // Применяем трансформацию напрямую к DOM для избежания ререндеров
    useEffect(() => {
        if (transformContainerRef.current) {
            transformContainerRef.current.style.transform = `translate(${position.x}px, ${position.y}px) scale(${zoom})`;
        }
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

                const delta =
                    -e.deltaY * 0.01 * MAP_CONSTANTS.WHEEL_ZOOM_SENSITIVITY;
                const newZoom = Math.min(
                    Math.max(zoom + delta, MAP_CONSTANTS.MIN_ZOOM),
                    MAP_CONSTANTS.MAX_ZOOM
                );
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

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        },
        [isAnimating]
    );

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!isDragging || isAnimating) return;

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

    const animateTo = useCallback(
        (targetZoom: number, targetPosition: { x: number; y: number }) => {
            setIsAnimating(true);

            const startZoom = zoomRef.current;
            const startPosition = { ...positionRef.current };
            const startTime = performance.now();
            const duration = MAP_CONSTANTS.ANIMATION_DURATION;

            const animate = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                const easeProgress =
                    progress < 0.5
                        ? 4 * progress * progress * progress
                        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

                const newZoom =
                    startZoom + (targetZoom - startZoom) * easeProgress;
                const newX =
                    startPosition.x +
                    (targetPosition.x - startPosition.x) * easeProgress;
                const newY =
                    startPosition.y +
                    (targetPosition.y - startPosition.y) * easeProgress;

                dispatch(setZoom(newZoom));
                dispatch(setPosition({ x: newX, y: newY }));

                if (progress < 1) {
                    animationFrameRef.current = requestAnimationFrame(animate);
                } else {
                    setIsAnimating(false);
                    dispatch(setZoom(targetZoom));
                    dispatch(setPosition(targetPosition));
                }
            };

            animationFrameRef.current = requestAnimationFrame(animate);
        },
        [dispatch]
    );

    const handleFitToView = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        animateTo(MAP_CONSTANTS.INITIAL_ZOOM, MAP_CONSTANTS.INITIAL_POSITION);
    }, [animateTo]);

    const handleZoomIn = useCallback(() => {
        if (isAnimating) return;
        const newZoom = Math.min(
            zoom + MAP_CONSTANTS.BUTTON_ZOOM_STEP,
            MAP_CONSTANTS.MAX_ZOOM
        );
        if (newZoom !== zoom) {
            dispatch(setZoom(newZoom));
        }
    }, [zoom, dispatch, isAnimating]);

    const handleZoomOut = useCallback(() => {
        if (isAnimating) return;
        const newZoom = Math.max(
            zoom - MAP_CONSTANTS.BUTTON_ZOOM_STEP,
            MAP_CONSTANTS.MIN_ZOOM
        );
        if (newZoom !== zoom) {
            dispatch(setZoom(newZoom));
        }
    }, [zoom, dispatch, isAnimating]);

    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return (
        <div className="w-full h-full bg-primary relative overflow-hidden">
            <div className="absolute bottom-4 right-4 z-10">
                <ZoomControlsComponent
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onFitToView={handleFitToView}
                    zoom={zoom}
                    minZoom={MAP_CONSTANTS.MIN_ZOOM}
                    maxZoom={MAP_CONSTANTS.MAX_ZOOM}
                />
            </div>

            <div
                ref={containerRef}
                className="w-full h-full cursor-grab bg-primary overflow-hidden"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                style={{
                    userSelect: "none",
                    touchAction: "none",
                    cursor: isAnimating
                        ? "wait"
                        : isDragging
                        ? "grabbing"
                        : "grab",
                }}
                role="application"
                aria-label="Интерактивная карта организационной структуры"
            >
                <SvgDotPattern position={position} />

                {/* Контейнер для трансформации всего дерева */}
                <div
                    ref={transformContainerRef}
                    className="absolute top-0 left-0"
                    style={{
                        transformOrigin: "0 0",
                        width: "10000px",
                        height: "4000px",
                        transition: isAnimating
                            ? `transform ${MAP_CONSTANTS.ANIMATION_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
                            : "none",
                    }}
                >
                    <OrganizationTree />
                </div>
            </div>
        </div>
    );
};

export default CustomCanvas;
