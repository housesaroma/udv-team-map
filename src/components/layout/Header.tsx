import React from "react";
import { useNavigate } from "react-router-dom";
import { Menubar } from "primereact/menubar";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";

const Header: React.FC = () => {
    const navigate = useNavigate();

    const startContent = (
        <Button
            onClick={() => navigate("/")}
            text
            className="p-0 hover:bg-transparent focus:shadow-none"
        >
            <div className="flex items-center">
                <img
                    src="src/assets/logo.svg"
                    alt="UDV Team Map Logo"
                    className="h-8"
                />
            </div>
        </Button>
    );

    const endContent = (
        <div className="flex items-center gap-4">
            <Button
                onClick={() => navigate("/profile")}
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
