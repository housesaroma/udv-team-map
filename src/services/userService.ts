import { API_USERS } from "./apiConstants";
import { getDepartmentInfo } from "../utils/departmentUtils";
import type { ApiUserProfile, User } from "../types";
import { MOCK_USERS } from "../constants/mockUsers";

export const userService = {
    async getUserProfile(userId: string): Promise<User> {
        // Сначала проверяем mock данные для текущего пользователя
        const mockUser = this.getMockUser(userId);
        if (mockUser) {
            console.log("Используем mock данные для пользователя:", userId);
            return mockUser;
        }

        // Валидация UUID
        if (!this.isValidUUID(userId)) {
            throw new Error("Неверный формат ID пользователя");
        }

        try {
            const response = await fetch(`${API_USERS}/${userId}`);

            // Проверка статуса ответа
            if (response.status === 404) {
                throw new Error("Пользователь не найден");
            }

            if (response.status === 400) {
                throw new Error("Неверный запрос");
            }

            if (response.status === 500) {
                throw new Error("Ошибка сервера");
            }

            if (!response.ok) {
                throw new Error(`Ошибка загрузки профиля: ${response.status}`);
            }

            // Проверяем, что ответ не пустой
            const responseText = await response.text();
            if (!responseText) {
                throw new Error("Пустой ответ от сервера");
            }

            const apiData: ApiUserProfile = JSON.parse(responseText);

            // Проверяем, что основные поля присутствуют
            if (!apiData.user_id || !apiData.userName) {
                throw new Error("Некорректные данные профиля");
            }

            return transformApiUserToUser(apiData);
        } catch (error) {
            // Перебрасываем наши кастомные ошибки
            if (
                error instanceof Error &&
                (error.message.includes("не найден") ||
                    error.message.includes("Неверный формат"))
            ) {
                throw error;
            }

            // Обработка сетевых ошибок и ошибок JSON
            if (error instanceof SyntaxError) {
                throw new Error("Некорректный ответ от сервера");
            }

            if (error instanceof TypeError) {
                throw new Error("Проблема с подключением к серверу");
            }

            throw new Error("Неизвестная ошибка при загрузке профиля");
        }
    },

    isValidUUID(uuid: string): boolean {
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    },

    getMockUser(userId: string): User | null {
        // Ищем пользователя в mock данных по ID
        const mockUser = Object.values(MOCK_USERS).find(
            (user) => user.id === userId
        );
        return mockUser || null;
    },

    // Метод для получения всех mock пользователей (может пригодиться)
    getMockUsers(): User[] {
        return Object.values(MOCK_USERS);
    },
};

const transformApiUserToUser = (apiUser: ApiUserProfile): User => {
    const nameParts = apiUser.userName.split(" ");

    return {
        id: apiUser.user_id,
        firstName: nameParts[1] || "",
        lastName: nameParts[0] || "",
        middleName: nameParts[2] || "",
        position: apiUser.position,
        department: getDepartmentInfo(apiUser.department),
        avatar: apiUser.avatar,
        phone: apiUser.phoneNumber,
        city: apiUser.city,
        interests: apiUser.interests,
        birthDate: apiUser.bornDate,
        hireDate: apiUser.workExperience,
        messengerLink: apiUser.contacts.telegram[0] || "",
    };
};
