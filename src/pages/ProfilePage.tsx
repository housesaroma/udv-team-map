import { Button } from "primereact/button";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageLoader } from "../components/ui/PageLoader";
import { useAuth } from "../hooks/useAuth";
import { userService } from "../services/userService";
import type { User } from "../types";
import { calculateExperience, formatDate } from "../utils/dateUtils";

const ProfilePage: React.FC = () => {
    const { userId } = useParams();
    const { logout, user: currentUser } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState<boolean>(false);
    const [usingMockData, setUsingMockData] = useState<boolean>(false);

    // Загрузка данных профиля
    useEffect(() => {
        const loadProfile = async () => {
            // Если это личный профиль (без userId) и есть текущий пользователь
            if (!userId && currentUser) {
                try {
                    setLoading(true);
                    setError(null);
                    setNotFound(false);

                    // Для личного профиля используем данные текущего пользователя
                    const userProfile = await userService.getUserProfile(
                        currentUser.id
                    );
                    setProfile(userProfile);
                    setUsingMockData(true); // Помечаем что используем mock данные
                } catch (err) {
                    console.error("Ошибка загрузки личного профиля:", err);
                    setError("Ошибка загрузки профиля");
                } finally {
                    setLoading(false);
                }
                return;
            }

            // Если указан userId (чужой профиль)
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                setNotFound(false);
                setUsingMockData(false);

                const userProfile = await userService.getUserProfile(userId);
                setProfile(userProfile);
            } catch (err) {
                console.error("Ошибка загрузки профиля:", err);

                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Произошла ошибка при загрузке профиля";
                setError(errorMessage);

                // Определяем, является ли ошибка "не найден"
                if (
                    errorMessage.includes("не найден") ||
                    errorMessage.includes("Неверный формат") ||
                    errorMessage.includes("404")
                ) {
                    setNotFound(true);
                }
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [userId, currentUser]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleGoHome = () => {
        navigate("/");
    };

    const handleGoToMyProfile = () => {
        navigate("/profile");
    };

    const isOwnProfile = !userId || userId === currentUser?.id;

    if (loading) {
        return <PageLoader />;
    }

    // Обработка случая когда профиль не найден
    if (notFound) {
        return (
            <div className="container mx-auto p-6 pt-24">
                <div className="bg-secondary rounded-lg shadow-md p-8 text-center">
                    <div className="mb-6">
                        <i className="pi pi-user-slash text-6xl text-gray-400 mb-4"></i>
                        <h2 className="text-2xl font-bold text-gray-700 font-golos mb-2">
                            Профиль не найден
                        </h2>
                        <p className="text-gray-600 font-golos">
                            {error ||
                                "Пользователь с таким ID не существует или был удален"}
                        </p>
                    </div>
                    <div className="flex justify-center space-x-4">
                        <Button
                            label="На главную"
                            icon="pi pi-home"
                            onClick={handleGoHome}
                            className="font-inter"
                        />
                        {currentUser && (
                            <Button
                                label="Мой профиль"
                                icon="pi pi-user"
                                onClick={handleGoToMyProfile}
                                className="font-inter bg-primary border-primary"
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Обработка других ошибок
    if (error && !profile) {
        return (
            <div className="container mx-auto p-6 pt-24">
                <div className="bg-secondary rounded-lg shadow-md p-8 text-center">
                    <div className="mb-6">
                        <i className="pi pi-exclamation-triangle text-6xl text-yellow-500 mb-4"></i>
                        <h2 className="text-2xl font-bold text-gray-700 font-golos mb-2">
                            Ошибка загрузки
                        </h2>
                        <p className="text-gray-600 font-golos mb-4">
                            {getUserFriendlyError(error)}
                        </p>
                    </div>
                    <div className="flex justify-center space-x-4">
                        <Button
                            label="Попробовать снова"
                            icon="pi pi-refresh"
                            onClick={() => globalThis.location.reload()}
                            className="font-inter"
                        />
                        <Button
                            label="На главную"
                            icon="pi pi-home"
                            onClick={handleGoHome}
                            severity="secondary"
                            className="font-inter"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 pt-24">
            <div className="bg-secondary rounded-lg shadow-md p-8">
                {/* Заголовок и кнопка выхода */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-primary font-golos">
                            {profile
                                ? `${profile.lastName} ${profile.firstName} ${
                                      profile.middleName || ""
                                  }`.trim()
                                : "Профиль сотрудника"}
                        </h1>
                        {usingMockData && (
                            <p className="text-sm text-gray-500 font-golos mt-1">
                                📋 Используются тестовые данные
                            </p>
                        )}
                    </div>
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
                                                Email:
                                            </span>{" "}
                                            {profile.email || "Не указан"}
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
                                            {profile.department?.name ||
                                                "Не указано"}
                                        </div>
                                        <div>
                                            <span className="font-medium">
                                                Должность:
                                            </span>{" "}
                                            {profile.position || "Не указана"}
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

// Функция для преобразования технических ошибок в понятные пользователю сообщения
const getUserFriendlyError = (error: string): string => {
    if (
        error.includes("Unexpected end of JSON input") ||
        error.includes("Некорректный ответ")
    ) {
        return "Сервер вернул некорректные данные. Попробуйте позже.";
    }
    if (
        error.includes("Failed to fetch") ||
        error.includes("проблема с подключением")
    ) {
        return "Проблема с подключением к серверу. Проверьте интернет-соединение.";
    }
    if (error.includes("500") || error.includes("Ошибка сервера")) {
        return "Временная проблема на сервере. Попробуйте позже.";
    }
    if (error.includes("400") || error.includes("Неверный запрос")) {
        return "Неверный запрос. Проверьте корректность данных.";
    }
    return error;
};

export default ProfilePage;
