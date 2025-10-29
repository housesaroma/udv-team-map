import React, { useState } from "react";
import { EmployeesTable } from "../components/features/admin/EmployeesTable";
import { PhotoModeration } from "../components/features/admin/PhotoModeration";

const AdminPanel: React.FC = () => {
    const [activeView, setActiveView] = useState<"employees" | "photos">(
        "employees"
    );

    return (
        <div className="container mx-auto p-6 pt-24">
            <div className="bg-secondary rounded-lg shadow-md p-8">
                {/* Переключатель видов */}
                <div className="flex mb-8">
                    <div className="rounded-lg p-1 flex">
                        <button
                            onClick={() => setActiveView("employees")}
                            className={`px-6 py-3 rounded-md transition-colors font-inter mr-4 ${
                                activeView === "employees"
                                    ? "bg-accent text-white shadow-sm"
                                    : "text-gray-600 hover:text-gray-800"
                            }`}
                        >
                            Сотрудники
                        </button>
                        <button
                            onClick={() => setActiveView("photos")}
                            className={`px-6 py-3 rounded-md transition-colors font-inter ${
                                activeView === "photos"
                                    ? "bg-accent text-white shadow-sm"
                                    : "text-gray-600 hover:text-gray-800"
                            }`}
                        >
                            Модерация фото
                        </button>
                    </div>
                </div>

                {/* Отображение активного компонента */}
                <div className="mb-8">
                    {activeView === "employees" ? (
                        <EmployeesTable />
                    ) : (
                        <PhotoModeration />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
