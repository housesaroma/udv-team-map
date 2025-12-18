import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { useAuth } from "../hooks/useAuth";
import { USE_MOCK_DATA } from "../constants/apiConstants";
import { ROUTES } from "../constants/routes";
import {
  createLoginSchema,
  type LoginFormValues,
} from "../validation/loginSchema";

const LoginPage: React.FC = () => {
  const [submitError, setSubmitError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(createLoginSchema(USE_MOCK_DATA)),
    mode: "onChange",
    reValidateMode: "onBlur",
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const usernameHint = USE_MOCK_DATA
    ? "Используйте корпоративный email"
    : "Минимум 3 символа";
  const passwordHint = "Минимум 8 символов";

  const onSubmit = async ({ username, password }: LoginFormValues) => {
    setSubmitError("");

    try {
      await login(username.trim(), password);
      navigate(ROUTES.root);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      setSubmitError(`Ошибка авторизации: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="bg-secondary rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-primary text-center mb-6 font-golos">
          Авторизация
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-primary font-golos"
            >
              {USE_MOCK_DATA
                ? "Email или имя пользователя"
                : "Имя пользователя"}
            </label>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <InputText
                  id="username"
                  type="text"
                  {...field}
                  value={field.value ?? ""}
                  onChange={e => field.onChange(e.target.value)}
                  placeholder={
                    USE_MOCK_DATA
                      ? "Введите email или имя пользователя"
                      : "Введите имя пользователя"
                  }
                  className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.username
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  aria-invalid={errors.username ? "true" : "false"}
                />
              )}
            />
            <div className="min-h-[1rem]">
              <small
                className={`text-xs font-golos ${
                  errors.username ? "text-red-600" : "text-gray-500"
                }`}
              >
                {errors.username?.message ?? <></>}
              </small>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-primary font-golos"
            >
              Пароль
            </label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <div className="w-full">
                  <Password
                    id="password"
                    value={field.value ?? ""}
                    onChange={e => field.onChange(e.target.value)}
                    placeholder="Введите пароль"
                    toggleMask
                    feedback={false}
                    className="w-full"
                    inputClassName={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    style={{ display: "block" }}
                  />
                </div>
              )}
            />
            <div className="min-h-[1rem]">
              <small
                className={`text-xs font-golos ${
                  errors.password ? "text-red-600" : "text-gray-500"
                }`}
              >
                {errors.password?.message ?? <></>}
              </small>
            </div>
          </div>

          {submitError && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-md">
              <p className="text-red-700 text-sm font-golos">{submitError}</p>
            </div>
          )}

          <Button
            type="submit"
            label="Войти"
            loading={isSubmitting}
            disabled={!isValid || isSubmitting}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-md transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </form>

        {USE_MOCK_DATA ? (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-blue-700 text-sm font-golos mb-2"></p>

            <>
              <strong>Тестовые данные:</strong>
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
            </>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
