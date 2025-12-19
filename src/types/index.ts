export type MessengerType =
  | "telegram"
  | "skype"
  | "linkedin"
  | "whatsapp"
  | "vk"
  | "mattermost";

export interface UserContacts {
  telegram?: string;
  skype?: string;
  linkedin?: string;
  whatsapp?: string;
  vk?: string;
  mattermost?: string;
}

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
  hierarchyId?: number;
  subordinates?: string[];
  messengerLink?: string;
  contacts?: UserContacts;
  skills?: string[];
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

export interface DepartmentColors {
  it: string;
  hr: string;
  finance: string;
  marketing: string;
  sales: string;
  operations: string;
  [key: string]: string;
}

export type { ApiUserProfile } from "../validation/apiSchemas";
