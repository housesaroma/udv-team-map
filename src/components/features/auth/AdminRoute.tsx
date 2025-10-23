import React from "react";
import { Navigate } from "react-router-dom";
import { usePermissions } from "../../../hooks/usePermissions";
import { Permission } from "../../../types/permissions";

interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { hasPermission, isLoading } = usePermissions();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg font-golos">Загрузка...</div>
            </div>
        );
    }

    if (!hasPermission(Permission.ACCESS_ADMIN_PANEL)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;
