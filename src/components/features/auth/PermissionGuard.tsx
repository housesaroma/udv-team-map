import React from "react";
import type { Permission } from "../../../types/permissions";
import { usePermissions } from "../../../hooks/usePermissions";

interface PermissionGuardProps {
    children: React.ReactNode;
    permission: Permission;
    fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
    children,
    permission,
    fallback = null,
}) => {
    const { hasPermission } = usePermissions();

    if (!hasPermission(permission)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
