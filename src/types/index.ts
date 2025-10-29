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
  userName: string;
  position: string;
  department: string;
  userId: string;
  avatar?: string;
  phoneNumber?: string;
  city?: string;
  interests?: string;
  bornDate?: string;
  workExperience?: string;
  contacts?: {
    telegram?: string[];
    skype?: string[];
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
