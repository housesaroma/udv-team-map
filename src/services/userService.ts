import type { User } from "../types";
import { API_USERS } from "./apiConstants";

export interface ApiUserProfile {
    user_id: string;
    userName: string;
    bornDate: string;
    department: string;
    position: string;
    workExperience: string;
    phoneNumber: string;
    city: string;
    interests: string;
    avatar: string;
    contacts: {
        skype: string[];
        telegram: string[];
    };
}

export const userService = {
    async getUserProfile(userId: string): Promise<User> {
        const response = await fetch(`${API_USERS}/${userId}`);
        if (!response.ok) {
            throw new Error(`Ошибка загрузки профиля: ${response.status}`);
        }

        const apiData: ApiUserProfile = await response.json();

        return transformApiUserToUser(apiData);
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
        department: {
            id: "",
            name: apiUser.department,
            color: "#6B7280",
        },
        avatar: apiUser.avatar,
        phone: apiUser.phoneNumber,
        city: apiUser.city,
        interests: apiUser.interests,
        birthDate: apiUser.bornDate,
        hireDate: apiUser.workExperience,
        messengerLink: apiUser.contacts.telegram[0] || "",
    };
};
