import React from "react";
import CustomCanvas from "../components/features/map/CustomInfiniteCanvas";

const HomePage: React.FC = () => {
    return (
        <div className="w-full h-full min-h-0 bg-primary relative">
            <CustomCanvas />
        </div>
    );
};

export default HomePage;