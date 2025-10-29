import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import styles from "./AdminButton.module.css";
import { PermissionGuard } from "../../features/auth/PermissionGuard";
import { Permission } from "../../../types/permissions";

export const AdminButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PermissionGuard permission={Permission.ACCESS_ADMIN_PANEL}>
      <Button
        onClick={() => navigate("/admin")}
        label="Административная панель"
        text
        style={{
          color: "#28CA9E",
          border: "1px solid #f8fafc",
        }}
        className={`${styles.adminButton} p-2 hover:bg-transparent focus:shadow-none font-inter hover:opacity-80 transition-opacity rounded-md`}
        tooltip="Перейти в административную панель"
        tooltipOptions={{ position: "bottom" }}
      />
    </PermissionGuard>
  );
};
