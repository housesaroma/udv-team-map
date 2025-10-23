import React from "react";
import { Loader } from "./Loader";

export const PageLoader: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-primary">
            <Loader size="lg" text="Загрузка" />
        </div>
    );
};