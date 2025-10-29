import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="bg-secondary rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {/* Иконка и код ошибки */}
        <div className="text-6xl text-gray-400 mb-4">404</div>

        <h1 className="text-2xl font-bold text-primary mb-4 font-inter">
          Страница не найдена
        </h1>

        <p className="text-gray-600 mb-6 font-inter">
          Запрашиваемая страница не существует или была перемещена.
        </p>

        {/* Кнопки действий */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => navigate("/")}
            label="На главную"
            icon="pi pi-home"
            className="bg-accent hover:bg-accent/90 text-white font-inter"
          />

          <Button
            onClick={() => navigate(-1)}
            label="Вернуться назад"
            icon="pi pi-arrow-left"
            text
            className="text-primary font-inter"
          />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
