import React, { useState, useEffect, useMemo } from "react";
import type { User } from "../types";
import { MOCK_USERS } from "../constants/mockUsers";
import { AuthContext } from "./AuthContextInstance";
import { PageLoader } from "../components/ui/PageLoader";

export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        const userRole = localStorage.getItem(
            "userRole"
        ) as keyof typeof MOCK_USERS;

        if (token && userRole && MOCK_USERS[userRole]) {
            setUser(MOCK_USERS[userRole]);
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            if (password !== "password123") {
                throw new Error("Неверный пароль");
            }

            let userRole: keyof typeof MOCK_USERS = "employee";

            if (email.includes("admin")) {
                userRole = "admin";
            } else if (email.includes("hr")) {
                userRole = "hr";
            }

            const mockUser = MOCK_USERS[userRole];
            if (!mockUser) {
                throw new Error("Пользователь не найден");
            }

            setUser(mockUser);
            localStorage.setItem("authToken", "mock-token");
            localStorage.setItem("userRole", userRole);
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
    };

    const contextValue = useMemo(
        () => ({
            user,
            isLoading,
            login,
            logout,
        }),
        [user, isLoading]
    );

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
