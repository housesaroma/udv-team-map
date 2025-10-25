export interface User {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    position: string;
    department: Department;
    avatar?: string;
    phone?: string;
    email?: string;
    city?: string;
    interests?: string;
    birthDate?: string;
    hireDate?: string;
    managerId?: string;
    subordinates?: string[];
    messengerLink?: string;
}

export interface Department {
    id: string;
    name: string;
    color: string;
}

export interface ModerationItem {
    id: string;
    userId: string;
    user: User;
    currentPhoto: string;
    newPhoto: string;
}

export type UserRole = "employee" | "hr" | "admin";

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

export interface DepartmentColors {
    it: string;
    hr: string;
    finance: string;
    marketing: string;
    sales: string;
    operations: string;
    [key: string]: string;
}
