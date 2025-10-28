import { API_USERS, USE_MOCK_DATA } from "../constants/apiConstants";
import { MOCK_USERS_RESPONSE } from "../constants/mockUsersProfile";
import type { ApiUserProfile, User } from "../types";
import { departmentColors } from "../utils/departmentUtils";

// Типы для ответа API
export interface UsersResponse {
    amountOfUsers: number;
    users: ApiUserProfile[];
}

// Вспомогательная функция для преобразования ApiUserProfile в User
const transformApiUserToUser = (apiUser: ApiUserProfile): User => {
    const nameParts = apiUser.userName.split(" ");

    const departmentName = apiUser.department.toLowerCase();
    const departmentColor = departmentColors[departmentName] || "#6B7280";

    return {
        id: apiUser.user_id,
        firstName: nameParts[1] || "", // Имя
        lastName: nameParts[0] || "", // Фамилия
        middleName: nameParts[2] || "", // Отчество
        position: apiUser.position,
        department: {
            id: departmentName,
            name: apiUser.department,
            color: departmentColor,
        },
        avatar: apiUser.avatar,
        phone: apiUser.phoneNumber,
        city: apiUser.city,
        interests: apiUser.interests,
        birthDate: apiUser.bornDate,
        // workExperience преобразуется в hireDate (нужно будет вычислить)
        hireDate: apiUser.workExperience,
        messengerLink:
            apiUser.contacts.telegram?.[0] || apiUser.contacts.skype?.[0],
    };
};

export const adminService = {
    async getUsers(): Promise<UsersResponse> {
        // Если используем мок-данные, возвращаем их сразу
        if (USE_MOCK_DATA) {
            console.log("📁 Используются мок-данные пользователей");
            return MOCK_USERS_RESPONSE;
        }

        // Иначе загружаем с бэкенда
        console.log("🌐 Загрузка данных пользователей с бэкенда...");
        try {
            const response = await fetch(API_USERS);

            if (!response.ok) {
                throw new Error(
                    `Ошибка загрузки пользователей: ${response.status}`
                );
            }

            const data: UsersResponse = await response.json();
            return data;
        } catch (error) {
            console.error(
                "Ошибка загрузки с бэкенда, используем мок-данные:",
                error
            );
            return MOCK_USERS_RESPONSE;
        }
    },

    // Метод для получения пользователей в формате User (трансформированном)
    async getUsersTransformed(): Promise<User[]> {
        const response = await this.getUsers();
        return response.users.map(transformApiUserToUser);
    },

    // Метод для получения текущего режима
    isUsingMockData(): boolean {
        return USE_MOCK_DATA;
    },
};
