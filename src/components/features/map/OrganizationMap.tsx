import React, { useRef } from "react";
import {
    ReactInfiniteCanvas,
    type ReactInfiniteCanvasHandle,
} from "react-infinite-canvas";

const COMPONENT_POSITIONS = {
    TOP_LEFT: "top-left",
    TOP_RIGHT: "top-right",
    BOTTOM_LEFT: "bottom-left",
    BOTTOM_RIGHT: "bottom-right",
} as const;

const OrganizationMap: React.FC = () => {
    const canvasRef = useRef<ReactInfiniteCanvasHandle>(null);

    const handleFitToView = () => {
        canvasRef.current?.fitContentToView({ scale: 1 });
    };

    return (
        <div className="w-full h-full bg-primary">
            <ReactInfiniteCanvas
                ref={canvasRef}
                minZoom={0.25}
                maxZoom={5}
                panOnScroll={true}
                customComponents={[
                    {
                        component: (
                            <button
                                onClick={handleFitToView}
                                className="p-2 bg-secondary rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 text-gray-800 font-golos font-medium"
                            >
                                Fit to View
                            </button>
                        ),
                        position: COMPONENT_POSITIONS.TOP_LEFT,
                        offset: { x: 120, y: 10 },
                    },
                ]}
                scrollBarConfig={{
                    renderScrollBar: true,
                    startingPosition: { x: 0, y: 0 },
                    offset: { x: 0, y: 0 },
                    color: "white",
                    thickness: "8px",
                    minSize: "15px",
                }}
            >
                {/* Заглушка "функционал в разработке" */}
                <div className="bg-secondary border border-gray-200 rounded-lg p-8 text-center max-w-md font-golos shadow-lg">
                    <div className="text-primary mb-4">
                        <i className="pi pi-info-circle text-4xl"></i>
                    </div>
                    <h3 className="text-xl text-primary mb-3 font-bold">
                        Функционал в разработке
                    </h3>
                    <p className="text-gray-700 mb-4">
                        Организационная структура компании будет отображаться
                        здесь в виде интерактивного дерева
                    </p>
                    <div className="text-sm text-gray-600">
                        Скоро здесь появится древовидная схема сотрудников
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
            </ReactInfiniteCanvas>
        </div>
    );
};

export default OrganizationMap;
