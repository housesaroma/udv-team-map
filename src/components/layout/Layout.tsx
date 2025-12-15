import React, { useMemo } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import {
  OnboardingTour,
  useOnboardingTour,
  filterTourStepsByRole,
} from "../features/onboarding";
import { usePermissions } from "../../hooks/usePermissions";

const Layout: React.FC = () => {
  const { isActive, completeTour, skipTour } = useOnboardingTour();
  const { userRole } = usePermissions();

  // Фильтруем шаги тура по роли пользователя
  const filteredTourSteps = useMemo(
    () => filterTourStepsByRole(userRole),
    [userRole]
  );

  return (
    <div className="h-screen flex flex-col bg-primary font-golos">
      <Header />
      <main className="bg-primary">
        <Outlet />
      </main>

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

export default Layout;
