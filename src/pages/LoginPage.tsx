import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { useAuth } from "../hooks/useAuth";

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await login(email, password);
            navigate("/");
        } catch (e) {
            setError(`Неверный email или пароль: ${e}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary">
            <div className="bg-secondary rounded-lg shadow-lg p-8 max-w-md w-full">
                <h1 className="text-3xl font-bold text-primary text-center mb-6 font-golos">
                    Авторизация
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-primary font-golos"
                        >
                            Email
                        </label>
                        <InputText
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Введите ваш email"
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-primary font-golos"
                        >
                            Пароль
                        </label>
                        <div className="w-full"> {/* Добавляем обертку */}
                            <Password
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Введите пароль"
                                toggleMask
                                feedback={false}
                                className="w-full"
                                inputClassName="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ display: 'block' }} // Переопределяем inline-flex
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-100 border border-red-300 rounded-md">
                            <p className="text-red-700 text-sm font-golos">
                                {error}
                            </p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        label="Войти"
                        loading={isLoading}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-md transition duration-200"
                    />
                </form>

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-blue-700 text-sm font-golos mb-2">
                        <strong>Тестовые данные:</strong>
                    </p>
                    <p className="text-blue-600 text-xs font-golos">
                        • employee@udv.group (сотрудник)
                    </p>
                    <p className="text-blue-600 text-xs font-golos">
                        • hr@udv.group (HR)
                    </p>
                    <p className="text-blue-600 text-xs font-golos">
                        • admin@udv.group (администратор)
                    </p>
                    <p className="text-blue-600 text-xs font-golos mt-1">
                        Пароль для всех: password123
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;