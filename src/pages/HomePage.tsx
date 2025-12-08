import React from "react";
import CustomCanvas from "../components/features/map/CustomCanvas";
import { DepartmentTreeExplorer } from "../components/features/organization/DepartmentTreeExplorer";

const HomePage: React.FC = () => {
  return (
    <div className="w-full h-100vh bg-primary relative">
      <CustomCanvas>
        <DepartmentTreeExplorer />
      </CustomCanvas>
    </div>
  );
};

export default HomePage;
