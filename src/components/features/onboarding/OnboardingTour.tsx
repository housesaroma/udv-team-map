import React, { useState, useEffect, useCallback } from "react";
import { Button } from "primereact/button";

export interface TourStep {
  target: string; // CSS selector
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete: () => void;
  onSkip: () => void;
  isActive: boolean;
}

const TOOLTIP_OFFSET = 12;

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  steps,
  onComplete,
  onSkip,
  isActive,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [highlightPosition, setHighlightPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  const calculatePosition = useCallback(() => {
    const step = steps[currentStep];
    if (!step) return;

    const element = document.querySelector(step.target);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const placement = step.placement ?? "bottom";

    // Highlight position
    setHighlightPosition({
      top: rect.top + window.scrollY - 4,
      left: rect.left + window.scrollX - 4,
      width: rect.width + 8,
      height: rect.height + 8,
    });

    // Tooltip position
    const tooltipWidth = 320;
    const tooltipHeight = 150;

    let top = 0;
    let left = 0;

    switch (placement) {
      case "top":
        top = rect.top + window.scrollY - tooltipHeight - TOOLTIP_OFFSET;
        left = rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2;
        break;
      case "bottom":
        top = rect.bottom + window.scrollY + TOOLTIP_OFFSET;
        left = rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2;
        break;
      case "left":
        top = rect.top + window.scrollY + rect.height / 2 - tooltipHeight / 2;
        left = rect.left + window.scrollX - tooltipWidth - TOOLTIP_OFFSET;
        break;
      case "right":
        top = rect.top + window.scrollY + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + window.scrollX + TOOLTIP_OFFSET;
        break;
    }

    // Keep tooltip within viewport
    left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
    top = Math.max(16, top);

    setTooltipPosition({ top, left });
  }, [currentStep, steps]);

  useEffect(() => {
    if (!isActive) return;

    calculatePosition();

    const handleResize = () => calculatePosition();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
    };
  }, [isActive, calculatePosition]);

  useEffect(() => {
    if (!isActive) return;

    // Scroll element into view
    const step = steps[currentStep];
    if (!step) return;

    const element = document.querySelector(step.target);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      // Recalculate after scroll
      setTimeout(calculatePosition, 300);
    }
  }, [currentStep, isActive, steps, calculatePosition]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isActive || steps.length === 0) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[9998]"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          pointerEvents: "none",
        }}
      />

      {/* Highlight cutout */}
      <div
        className="fixed z-[9999] rounded-lg"
        style={{
          top: highlightPosition.top,
          left: highlightPosition.left,
          width: highlightPosition.width,
          height: highlightPosition.height,
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
          pointerEvents: "none",
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed z-[10000] bg-white rounded-lg shadow-2xl p-5"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          width: 320,
        }}
      >
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">
            Шаг {currentStep + 1} из {steps.length}
          </span>
          <button
            onClick={onSkip}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Пропустить
          </button>
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {step.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4">{step.content}</p>

        {/* Progress dots */}
        <div className="flex justify-center gap-1 mb-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? "bg-accent" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            label="Назад"
            icon="pi pi-arrow-left"
            className="p-button-text p-button-sm"
            onClick={handlePrev}
            disabled={currentStep === 0}
          />
          <Button
            label={currentStep === steps.length - 1 ? "Готово" : "Далее"}
            icon={
              currentStep === steps.length - 1
                ? "pi pi-check"
                : "pi pi-arrow-right"
            }
            iconPos="right"
            className="p-button-sm"
            onClick={handleNext}
            style={{ backgroundColor: "#28CA9E", borderColor: "#28CA9E" }}
          />
        </div>
      </div>
    </>
  );
};

export default OnboardingTour;
