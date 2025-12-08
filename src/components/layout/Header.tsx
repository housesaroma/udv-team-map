import React from "react";
import { useNavigate } from "react-router-dom";
import { Menubar } from "primereact/menubar";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { AdminButton } from "../ui/AdminButton/AdminButton";
import logo from "../../assets/logo.svg";
import { ROUTES } from "../../constants/routes";

const Header: React.FC = () => {
  const navigate = useNavigate();

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
    >
      <div className="flex items-center">
        <img src={logo} alt="UDV Team Map Logo" className="h-8" />
      </div>
    </Button>
  );

  const endContent = (
    <div className="flex items-center gap-4">
      <AdminButton />
      <Button
        onClick={() => navigate(ROUTES.profile.root)}
        text
        rounded
        className="p-0 hover:bg-transparent focus:shadow-none"
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
