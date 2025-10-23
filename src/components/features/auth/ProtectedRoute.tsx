import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { PageLoader } from "../../ui/PageLoader";

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
        return <PageLoader />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

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
