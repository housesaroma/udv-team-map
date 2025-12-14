import { useState, useEffect, useCallback } from "react";

// Hook для управления туром
const TOUR_COMPLETED_KEY = "udv_onboarding_completed";

export const useOnboardingTour = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Check if tour was already completed
    const completed = localStorage.getItem(TOUR_COMPLETED_KEY);
    if (!completed) {
      // Delay start to let the page render
      const timer = setTimeout(() => setIsActive(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeTour = useCallback(() => {
    localStorage.setItem(TOUR_COMPLETED_KEY, "true");
    setIsActive(false);
  }, []);

  const skipTour = useCallback(() => {
    localStorage.setItem(TOUR_COMPLETED_KEY, "true");
    setIsActive(false);
  }, []);

  const restartTour = useCallback(() => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
    setIsActive(true);
  }, []);

  return {
    isActive,
    completeTour,
    skipTour,
    restartTour,
  };
};
