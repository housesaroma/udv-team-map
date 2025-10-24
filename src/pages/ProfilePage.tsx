import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { useAuth } from "../hooks/useAuth";
import type { User } from "../types";
import { userService } from "../services/userService";
import { PageLoader } from "../components/ui/PageLoader";
import { calculateExperience, formatDate } from "../utils/dateUtils";

const ProfilePage: React.FC = () => {
    const { userId } = useParams();
    const { logout, user: currentUser } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Загрузка данных профиля
    useEffect(() => {
        const loadProfile = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const userProfile = await userService.getUserProfile(userId);
                setProfile(userProfile);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Произошла ошибка при загрузке профиля"
                );
                console.error("Ошибка загрузки профиля:", err);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [userId]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isOwnProfile = !userId || userId === currentUser?.id;

    if (loading) {
        return <PageLoader />;
    }

    if (error) {
        return (
            <div className="container mx-auto p-6 pt-24">
                <div className="bg-secondary rounded-lg shadow-md p-8 text-center">
                    <p className="text-red-600 text-lg font-golos mb-4">
                        Ошибка: {error}
                    </p>
                    <Button
                        label="Попробовать снова"
                        onClick={() => globalThis.location.reload()}
                        className="font-inter"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 pt-24">
            <div className="bg-secondary rounded-lg shadow-md p-8">
                {/* Заголовок и кнопка выхода */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-primary font-golos">
                        {profile
                            ? `${profile.lastName} ${profile.firstName} ${
                                  profile.middleName || ""
                              }`.trim()
                            : "Профиль сотрудника"}
                    </h1>
                    {isOwnProfile && (
                        <Button
                            onClick={handleLogout}
                            label="Выйти"
                            icon="pi pi-sign-out"
                            severity="danger"
                            className="font-inter"
                        />
                    )}
                </div>

                {profile ? (
                    <div className="space-y-8">
                        {/* Основная информация в две колонки */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Левая колонка - стаж и контакты */}
                            <div className="space-y-6">
                                {/* Стаж работы */}
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 font-golos">
                                        Стаж работы
                                    </h3>
                                    <p className="text-xl text-gray-900 font-golos font-medium">
                                        {calculateExperience(profile.hireDate)}
                                    </p>
                                </div>

                                {/* Общая информация */}
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 font-golos">
                                        Общая информация
                                    </h3>
                                    <div className="space-y-3 text-gray-700 font-golos">
                                        <div>
                                            <span className="font-medium">
                                                Город:
                                            </span>{" "}
                                            {profile.city || "Не указан"}
                                        </div>
                                        <div>
                                            <span className="font-medium">
                                                Телефон:
                                            </span>{" "}
                                            {profile.phone || "Не указан"}
                                        </div>
                                        <div>
                                            <span className="font-medium">
                                                Дата рождения:
                                            </span>{" "}
                                            {formatDate(profile.birthDate)}
                                        </div>
                                        <div>
                                            <span className="font-medium">
                                                Подразделение:
                                            </span>{" "}
                                            {profile.department.name}
                                        </div>
                                        <div>
                                            <span className="font-medium">
                                                Должность:
                                            </span>{" "}
                                            {profile.position}
                                        </div>
                                        {profile.messengerLink && (
                                            <div>
                                                <span className="font-medium">
                                                    Телеграм:
                                                </span>{" "}
                                                {profile.messengerLink}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Правая колонка - о себе */}
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 font-golos">
                                    О себе
                                </h3>
                                <p className="text-gray-700 font-golos leading-relaxed">
                                    {profile.interests ||
                                        "Информация не указана"}
                                </p>
                            </div>
                        </div>

                        {/* Разделитель */}
                        <hr className="my-6 border-gray-300" />

                        {/* Кнопки действий (только для своего профиля) */}
                        {isOwnProfile && (
                            <div className="flex justify-end space-x-4">
                                <Button
                                    label="Сохранить"
                                    icon="pi pi-check"
                                    className="font-inter bg-primary border-primary hover:bg-primary-dark"
                                />
                                <Button
                                    label="Редактировать"
                                    icon="pi pi-pencil"
                                    className="font-inter bg-secondary border-secondary hover:bg-secondary-dark"
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-600 text-lg font-golos">
                            Профиль не найден
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
