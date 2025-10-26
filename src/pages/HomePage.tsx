import React from "react";
import CustomCanvas from "../components/features/map/CustomInfiniteCanvas";

const HomePage: React.FC = () => {
    return (
        <div className="w-full h-100vh bg-primary relative">
            <CustomCanvas />
        </div>
    );
};

export default HomePage;