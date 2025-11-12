import { useAuth } from "../hooks/useAuth";
import { Permission, RolePermissions } from "../types/permissions";
import type { UserRole } from "../types";

export const usePermissions = () => {
  const { user, isLoading } = useAuth();

  const getUserRole = (): UserRole => {
    const storedRole = localStorage.getItem("userRole") as UserRole;
    return storedRole || "employee";
  };

  const hasPermission = (permission: Permission): boolean => {
    const userRole = getUserRole();
    const hasAccess = RolePermissions[userRole]?.includes(permission) || false;

    // Логирование для диагностики (можно убрать позже)
    if (permission === Permission.ACCESS_ADMIN_PANEL) {
      console.log("Проверка доступа к админ панели:", {
        userRole,
        permission,
        hasAccess,
        availablePermissions: RolePermissions[userRole],
      });
    }

    return hasAccess;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(hasPermission);
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(hasPermission);
  };

  const canEditProfile = (profileUserId: string): boolean => {
    if (!user) return false;

    if (user.id === profileUserId) {
      return hasPermission(Permission.EDIT_OWN_PROFILE);
    }

    return hasPermission(Permission.EDIT_OTHER_PROFILES);
  };

  const canEditSensitiveData = (profileUserId: string): boolean => {
    if (!user) return false;

    if (user.id === profileUserId) {
      return false;
    }

    return hasPermission(Permission.EDIT_SENSITIVE_DATA);
  };

  const getEditableFields = (profileUserId: string) => {
    const canEdit = canEditProfile(profileUserId);
    const canEditSensitive = canEditSensitiveData(profileUserId);

    return {
      basicInfo: canEdit
        ? ["phone", "email", "city", "interests", "avatar", "messengerLink"]
        : [],

      sensitiveInfo: canEditSensitive
        ? [
            "firstName",
            "lastName",
            "middleName",
            "position",
            "department",
            "birthDate",
            "hireDate",
            "managerId",
          ]
        : [],

      allEditableFields: [
        ...(canEdit
          ? ["phone", "email", "city", "interests", "avatar", "messengerLink"]
          : []),
        ...(canEditSensitive
          ? [
              "firstName",
              "lastName",
              "middleName",
              "position",
              "department",
              "birthDate",
              "hireDate",
              "managerId",
            ]
          : []),
      ],
    };
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canEditProfile,
    canEditSensitiveData,
    getEditableFields,
    userRole: getUserRole(),
    isLoading,
  };
};
