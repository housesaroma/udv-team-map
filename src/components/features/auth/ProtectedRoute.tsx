import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: "employee" | "hr" | "admin";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRole = "employee",
}) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg font-golos">Загрузка...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Проверка роли (в реальном приложении это будет на бэкенде)
    const userRole = localStorage.getItem("userRole") as
        | "employee"
        | "hr"
        | "admin"
        | null;

    if (requiredRole === "admin" && userRole !== "admin") {
        return <Navigate to="/" replace />;
    }

    if (requiredRole === "hr" && !["hr", "admin"].includes(userRole || "")) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
