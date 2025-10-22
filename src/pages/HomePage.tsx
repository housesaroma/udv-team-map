import React from "react";
import OrganizationMap from "../components/features/map/OrganizationMap";
import ZoomControls from "../components/features/map/ZoomControls";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

const HomePage: React.FC = () => {
    useKeyboardShortcuts();

    return (
        <div className="w-full h-full min-h-0 bg-primary">
            <OrganizationMap />
            <ZoomControls />
        </div>
    );
};

export default HomePage;
