import type { UserRole } from ".";

export enum Permission {
    // Просмотр организационной структуры
    VIEW_ORG_STRUCTURE = "view_org_structure",

    // Поиск сотрудников
    SEARCH_EMPLOYEES = "search_employees",

    // Просмотр профилей
    VIEW_OWN_PROFILE = "view_own_profile",
    VIEW_OTHER_PROFILES = "view_other_profiles",

    // Редактирование профилей
    EDIT_OWN_PROFILE = "edit_own_profile",
    EDIT_OTHER_PROFILES = "edit_other_profiles",

    // Редактирование чувствительных данных
    EDIT_SENSITIVE_DATA = "edit_sensitive_data", // ФИО, должность, подразделение и т.д.

    // Административные функции
    ACCESS_ADMIN_PANEL = "access_admin_panel",
    MODERATE_PHOTOS = "moderate_photos",

    // Управление пользователями
    MANAGE_USERS = "manage_users",
}

// Маппинг ролей на права
export const RolePermissions: Record<UserRole, Permission[]> = {
    employee: [
        Permission.VIEW_ORG_STRUCTURE,
        Permission.SEARCH_EMPLOYEES,
        Permission.VIEW_OWN_PROFILE,
        Permission.VIEW_OTHER_PROFILES,
        Permission.EDIT_OWN_PROFILE,
    ],

    hr: [
        Permission.VIEW_ORG_STRUCTURE,
        Permission.SEARCH_EMPLOYEES,
        Permission.VIEW_OWN_PROFILE,
        Permission.VIEW_OTHER_PROFILES,
        Permission.EDIT_OWN_PROFILE,
        Permission.ACCESS_ADMIN_PANEL,
        Permission.EDIT_OTHER_PROFILES,
        Permission.MODERATE_PHOTOS,
        Permission.EDIT_SENSITIVE_DATA,
    ],

    admin: [
        Permission.VIEW_ORG_STRUCTURE,
        Permission.SEARCH_EMPLOYEES,
        Permission.VIEW_OWN_PROFILE,
        Permission.VIEW_OTHER_PROFILES,
        Permission.EDIT_OWN_PROFILE,
        Permission.ACCESS_ADMIN_PANEL,
        Permission.EDIT_OTHER_PROFILES,
        Permission.MODERATE_PHOTOS,
        Permission.EDIT_SENSITIVE_DATA,
        Permission.MANAGE_USERS,
    ],
};
