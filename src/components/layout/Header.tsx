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
            className="p-0 hover:bg-transparent"
        >
            <div className="flex items-center">
                <div className="w-8 h-8 bg-secondary rounded-md mr-2 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">UDV</span>
                </div>
                <span className="font-bold text-xl text-secondary">
                    UDV Team Map
                </span>
            </div>
        </Button>
    );

    const endContent = (
        <div className="flex items-center gap-4">
            <Button
                onClick={() => navigate("/profile")}
                text
                rounded
                className="p-0 hover:bg-transparent"
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
        <header className="fixed top-0 left-0 right-0 z-50 bg-primary shadow-lg">
            <Menubar
                start={startContent}
                end={endContent}
                className="border-none bg-primary"
            />
        </header>
    );
};

export default Header;
