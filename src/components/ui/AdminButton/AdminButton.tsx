import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import styles from "./AdminButton.module.css";
import { Permission } from "../../../types/permissions";
import { usePermissions } from "../../../hooks/usePermissions";
import { ROUTES } from "../../../constants/routes";

export const AdminButton: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const hasAdminAccess = hasPermission(Permission.ACCESS_ADMIN_PANEL);

  // Для обычных пользователей показываем кнопку "Таблица сотрудников"
  if (!hasAdminAccess) {
    return (
      <Button
        onClick={() => navigate(ROUTES.admin)}
        label="Таблица сотрудников"
        text
        style={{
          color: "#28CA9E",
          border: "1px solid #f8fafc",
        }}
        className={`${styles.adminButton} p-2 hover:bg-transparent focus:shadow-none font-inter hover:opacity-80 transition-opacity rounded-md`}
        tooltip="Перейти к таблице сотрудников"
        tooltipOptions={{ position: "bottom" }}
        data-tour="admin-button"
      />
    );
  }

  // Для HR и админов показываем кнопку "Административная панель"
  return (
    <Button
      onClick={() => navigate(ROUTES.admin)}
      label="Административная панель"
      text
      style={{
        color: "#28CA9E",
        border: "1px solid #f8fafc",
      }}
      className={`${styles.adminButton} p-2 hover:bg-transparent focus:shadow-none font-inter hover:opacity-80 transition-opacity rounded-md`}
      tooltip="Перейти в административную панель"
      tooltipOptions={{ position: "bottom" }}
      data-tour="admin-button"
    />
  );
};
