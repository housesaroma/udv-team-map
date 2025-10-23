import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { useAuth } from "../hooks/useAuth";

const ProfilePage: React.FC = () => {
    const { userId } = useParams();
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="container mx-auto p-6 pt-24">
            <div className="bg-secondary rounded-lg shadow-md p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-primary font-golos">
                        {userId
                            ? `Профиль сотрудника #${userId}`
                            : "Мой профиль"}
                    </h1>
                    <Button
                        onClick={handleLogout}
                        label="Выйти"
                        icon="pi pi-sign-out"
                        severity="danger"
                        className="font-inter"
                    />
                </div>

                <div className="text-center mb-6">
                    <p className="text-gray-600 text-lg font-golos">
                        Страница профиля в разработке
                    </p>
                </div>

                <div className="mt-6 p-4 bg-department-hr bg-opacity-10 rounded-md border border-department-hr">
                    <p className="text-gray-700 font-golos">
                        Здесь будет отображаться информация о сотруднике,
                        фотография, контактные данные и возможность
                        редактирования (для своего профиля)
                    </p>
                </div>

                {/* Дополнительная информация для отладки */}
                {user && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
                        <p className="text-blue-700 font-golos text-sm">
                            <strong>Текущий пользователь:</strong>{" "}
                            {user.firstName} {user.lastName}
                        </p>
                        <p className="text-blue-700 font-golos text-sm">
                            <strong>Роль:</strong>{" "}
                            {localStorage.getItem("userRole")}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
