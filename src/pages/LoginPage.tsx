import React from "react";

const LoginPage: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-primary">
            <div className="bg-secondary rounded-lg shadow-lg p-8 max-w-md w-full">
                <h1 className="text-3xl font-bold text-primary text-center mb-6 font-golos">
                    Авторизация
                </h1>
                <p className="text-gray-600 text-center mb-6 font-golos">
                    Страница авторизации будет реализована после уточнения
                    деталей домена
                </p>
                <div className="bg-department-finance bg-opacity-10 border border-department-finance rounded-md p-4">
                    <p className="text-gray-700 text-sm font-golos">
                        Интеграция с системой аутентификации находится в
                        разработке
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
