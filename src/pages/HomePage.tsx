import React, { useMemo } from "react";
import CustomCanvas from "../components/features/map/CustomCanvas";
import { DepartmentTreeExplorer } from "../components/features/organization/DepartmentTreeExplorer";
import {
  OnboardingTour,
  useOnboardingTour,
  filterTourStepsByRole,
} from "../components/features/onboarding";
import { usePermissions } from "../hooks/usePermissions";

const HomePage: React.FC = () => {
  const { isActive, completeTour, skipTour } = useOnboardingTour();
  const { userRole } = usePermissions();

  // Фильтруем шаги тура по роли пользователя
  const filteredTourSteps = useMemo(
    () => filterTourStepsByRole(userRole),
    [userRole]
  );

  return (
    <div className="w-full h-100vh bg-primary relative">
      <CustomCanvas>
        <DepartmentTreeExplorer />
      </CustomCanvas>

      {/* Интерактивный тур для новых пользователей */}
      <OnboardingTour
        steps={filteredTourSteps}
        isActive={isActive}
        onComplete={completeTour}
        onSkip={skipTour}
      />
    </div>
  );
};

export default HomePage;
