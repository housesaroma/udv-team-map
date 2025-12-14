import React from "react";
import { useNavigate } from "react-router-dom";
import { Menubar } from "primereact/menubar";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { AdminButton } from "../ui/AdminButton/AdminButton";
import logo from "../../assets/logo.svg";
import { ROUTES } from "../../constants/routes";
import { usePermissions } from "../../hooks/usePermissions";
import { Permission } from "../../types/permissions";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canEditTree = hasPermission(Permission.ACCESS_ADMIN_PANEL);

  const handleLogoClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("department-tree:reset"));
    }
    navigate(ROUTES.root);
  };

  const startContent = (
    <Button
      onClick={handleLogoClick}
      text
      className="p-0 hover:bg-transparent focus:shadow-none"
      data-tour="logo"
    >
      <div className="flex items-center">
        <img src={logo} alt="UDV Team Map Logo" className="h-8" />
      </div>
    </Button>
  );

  const endContent = (
    <div className="flex items-center gap-4">
      <Button
        onClick={() => navigate(ROUTES.about)}
        icon="pi pi-info-circle"
        text
        rounded
        className="p-2 hover:bg-transparent focus:shadow-none hover:opacity-80 transition-opacity"
        tooltip="О системе"
        tooltipOptions={{ position: "bottom" }}
        style={{ color: "#f8fafc" }}
        data-tour="about-button"
      />
      {canEditTree && (
        <Button
          onClick={() => navigate(ROUTES.treeEditor)}
          label="Редактировать дерево"
          text
          style={{
            color: "#28CA9E",
            border: "1px solid #f8fafc",
          }}
          className="p-2 hover:bg-transparent focus:shadow-none font-inter hover:opacity-80 transition-opacity rounded-md"
          tooltip="Перейти к редактированию дерева"
          tooltipOptions={{ position: "bottom" }}
          data-tour="tree-editor-button"
        />
      )}
      <AdminButton />
      <Button
        onClick={() => navigate(ROUTES.profile.root)}
        text
        rounded
        className="p-0 hover:bg-transparent focus:shadow-none"
        data-tour="profile-button"
      >
        <Avatar
          icon="pi pi-user"
          shape="circle"
          className="bg-secondary text-primary"
        />
      </Button>
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm shadow-lg px-20 px-5 py-1">
      <Menubar
        start={startContent}
        end={endContent}
        model={[]}
        className="border-none bg-transparent"
      />
    </header>
  );
};

export default Header;
