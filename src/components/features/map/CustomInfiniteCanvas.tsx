import React, { useRef, useState, useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { setZoom, setPosition, resetZoom } from "../../../stores/mapSlice";
import { useKeyboardShortcuts } from "../../../hooks/useKeyboardShortcuts";
import { ZoomControlsComponent } from "./ZoomControls";

const CustomCanvas: React.FC = () => {
    const dispatch = useAppDispatch();
    const { zoom, position } = useAppSelector((state) => state.map);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Используем ref для позиции чтобы избежать замыканий
    const positionRef = useRef(position);
    const animationFrameRef = useRef<number>(0);

    // Синхронизируем ref с актуальной позицией
    useEffect(() => {
        positionRef.current = position;
    }, [position]);

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

                const delta = -e.deltaY * 0.005;
                const newZoom = Math.min(Math.max(zoom + delta, 0.25), 5);
                dispatch(setZoom(newZoom));
            }
        };

        container.addEventListener("wheel", handleWheel, { passive: false });
        return () => container.removeEventListener("wheel", handleWheel);
    }, [zoom, dispatch]);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.button !== 0) return;
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
        []
    );

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!isDragging) return;

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
        [isDragging, dragStart, dispatch]
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

    // Очистка при размонтировании
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    const handleFitToView = () => {
        dispatch(resetZoom());
        dispatch(setPosition({ x: 0, y: 0 }));
    };

    const handleZoomIn = () => {
        dispatch(setZoom(Math.min(zoom + 0.25, 5)));
    };

    const handleZoomOut = () => {
        dispatch(setZoom(Math.max(zoom - 0.25, 0.25)));
    };

    // Альтернативный вариант с SVG для лучшей производительности
    const SvgDotPattern = () => {
        return (
            <svg
                className="absolute inset-0 pointer-events-none w-full h-full"
                style={{
                    background: "transparent",
                }}
            >
                <defs>
                    <pattern
                        id="dot-pattern"
                        x={position.x % 20}
                        y={position.y % 20}
                        width="20"
                        height="20"
                        patternUnits="userSpaceOnUse"
                    >
                        <circle
                            cx="2"
                            cy="2"
                            r="1.5"
                            fill="rgba(156, 163, 175, 0.3)"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dot-pattern)" />
            </svg>
        );
    };

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
                    // Улучшаем производительность
                    transform: "translateZ(0)",
                    willChange: "transform",
                }}
                role="application"
                aria-label="Интерактивная карта организационной структуры"
            >
                {/* Паттерн точек на фоне */}
                <SvgDotPattern />
                {/* Раскомментируйте строку ниже для SVG варианта */}
                {/* <SvgDotPattern /> */}

                {/* Контент с трансформацией */}
                <div
                    className="w-full h-full"
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                        transformOrigin: "center center",
                        transition: isDragging
                            ? "none"
                            : "transform 0.1s ease-out",
                        // Улучшаем производительность анимаций
                        willChange: "transform",
                    }}
                >
                    {/* Заглушка "функционал в разработке" */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="bg-secondary border border-gray-200 rounded-lg p-8 text-center max-w-md font-golos shadow-lg">
                            <div className="text-primary mb-4">
                                <i className="pi pi-info-circle text-4xl"></i>
                            </div>
                            <h3 className="text-xl text-primary mb-3 font-bold">
                                Функционал в разработке
                            </h3>
                            <p className="text-gray-700 mb-4">
                                Организационная структура компании будет
                                отображаться здесь в виде интерактивного дерева
                            </p>
                            <div className="text-sm text-gray-600">
                                Скоро здесь появится древовидная схема
                                сотрудников
                            </div>

                            {/* Индикатор цветов отделов */}
                            <div className="flex justify-center space-x-2 mt-6">
                                <span className="w-3 h-3 bg-department-it rounded-full"></span>
                                <span className="w-3 h-3 bg-department-hr rounded-full"></span>
                                <span className="w-3 h-3 bg-department-finance rounded-full"></span>
                                <span className="w-3 h-3 bg-department-marketing rounded-full"></span>
                                <span className="w-3 h-3 bg-department-sales rounded-full"></span>
                                <span className="w-3 h-3 bg-department-operations rounded-full"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomCanvas;
