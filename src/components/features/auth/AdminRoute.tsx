import React from "react";
import { Navigate } from "react-router-dom";
import { usePermissions } from "../../../hooks/usePermissions";
import { Permission } from "../../../types/permissions";
import { PageLoader } from "../../ui/PageLoader";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { hasPermission, isLoading } = usePermissions();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!hasPermission(Permission.ACCESS_ADMIN_PANEL)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
