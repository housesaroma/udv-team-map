import React from "react";

const AdminPanel: React.FC = () => {
    return (
        <div className="container mx-auto p-6 pt-24">
            <div className="bg-secondary rounded-lg shadow-md p-8">
                <h1 className="text-3xl font-bold text-primary mb-4 font-golos">
                    Административная панель
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-department-it bg-opacity-10 border border-department-it rounded-lg p-4">
                        <h2 className="text-xl font-semibold text-department-it mb-2 font-golos">
                            Таблица сотрудников
                        </h2>
                        <p className="text-gray-700">
                            Здесь будет таблица со всеми сотрудниками, поиск и
                            фильтры
                        </p>
                    </div>
                    <div className="bg-department-sales bg-opacity-10 border border-department-sales rounded-lg p-4">
                        <h2 className="text-xl font-semibold text-department-sales mb-2 font-golos">
                            Модерация фотографий
                        </h2>
                        <p className="text-gray-700">
                            Здесь будут фотографии сотрудников для модерации
                        </p>
                    </div>
                </div>
                <p className="text-gray-500 text-center font-golos">
                    Админ-панель находится в разработке
                </p>
            </div>
        </div>
    );
};

export default AdminPanel;
