import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "primereact/button";

export interface TourStep {
  target: string; // CSS selector
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
  /** Маршрут, на который нужно перейти для этого шага */
  route?: string;
  /** Отключить автоматический скролл к элементу */
  disableScroll?: boolean;
  /** Требуется клик на целевой элемент для перехода к следующему шагу */
  requiresClick?: boolean;
  /** Следующий маршрут после клика (для навигационных кнопок) */
  nextRoute?: string;
  /** Затемнить только header, оставив основной контент в фокусе */
  highlightContent?: boolean;
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
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [highlightPosition, setHighlightPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const [isPulsing, setIsPulsing] = useState(false);
  const pulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const calculatePosition = useCallback(() => {
    const step = steps[currentStep];
    if (!step) return;

    const element = document.querySelector(step.target);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const placement = step.placement ?? "bottom";

    // Highlight position с увеличенным padding для лучшей видимости
    setHighlightPosition({
      top: rect.top + window.scrollY - 8,
      left: rect.left + window.scrollX - 8,
      width: rect.width + 16,
      height: rect.height + 16,
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

  // Функция для запуска пульсации при неправильном клике
  const triggerPulse = useCallback(() => {
    if (pulseTimeoutRef.current) {
      clearTimeout(pulseTimeoutRef.current);
    }
    setIsPulsing(true);
    pulseTimeoutRef.current = setTimeout(() => {
      setIsPulsing(false);
    }, 600);
  }, []);

  // Обработчик клика на оверлей (неправильный клик)
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const step = steps[currentStep];
      if (step?.requiresClick) {
        triggerPulse();
      }
    },
    [currentStep, steps, triggerPulse]
  );

  // Обработчик клика на целевой элемент
  const handleTargetClick = useCallback(() => {
    const step = steps[currentStep];
    if (!step?.requiresClick) return;

    // Если есть nextRoute - переходим на него
    if (step.nextRoute) {
      navigate(step.nextRoute);
    }

    // Переходим к следующему шагу
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  }, [currentStep, steps, navigate, onComplete]);

  // Навигация на нужный маршрут при смене шага (только для шагов без requiresClick)
  useEffect(() => {
    if (!isActive) return;

    const step = steps[currentStep];
    if (!step) return;

    // Если шаг требует клик - не навигируем автоматически
    if (step.requiresClick) return;

    // Если у шага есть route и мы не на нём - переходим
    if (step.route && location.pathname !== step.route) {
      navigate(step.route);
    }
  }, [currentStep, isActive, steps, navigate, location.pathname]);

  // Слушаем клики на целевой элемент
  useEffect(() => {
    if (!isActive) return;

    const step = steps[currentStep];
    if (!step?.requiresClick) return;

    const element = document.querySelector(step.target);
    if (!element) return;

    const clickHandler = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      handleTargetClick();
    };

    element.addEventListener("click", clickHandler, true);

    return () => {
      element.removeEventListener("click", clickHandler, true);
    };
  }, [isActive, currentStep, steps, handleTargetClick]);

  useEffect(() => {
    if (!isActive) return;

    const step = steps[currentStep];
    if (!step) return;

    // Функция для попытки найти элемент с повторами
    let attempts = 0;
    const maxAttempts = 20; // 20 попыток * 100мс = 2 секунды максимум
    let retryTimer: ReturnType<typeof setTimeout>;

    const tryFindElement = () => {
      const element = document.querySelector(step.target);
      if (element) {
        calculatePosition();
      } else if (attempts < maxAttempts) {
        attempts++;
        retryTimer = setTimeout(tryFindElement, 100);
      }
    };

    // Даём время на рендер после навигации
    const timer = setTimeout(tryFindElement, 100);

    const handleResize = () => calculatePosition();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize);

    return () => {
      clearTimeout(timer);
      clearTimeout(retryTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
    };
  }, [isActive, calculatePosition, currentStep, steps]);

  useEffect(() => {
    if (!isActive) return;

    const step = steps[currentStep];
    if (!step) return;

    // Пропускаем scroll если disableScroll = true
    if (step.disableScroll) {
      calculatePosition();
      return;
    }

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
  const isClickRequired = step.requiresClick === true;
  const isContentHighlight = step.highlightContent === true;

  // Для режима highlightContent получаем высоту header
  const getHeaderHeight = () => {
    if (!isContentHighlight) return 0;
    const header = document.querySelector("header");
    return header ? header.getBoundingClientRect().height : 70; // fallback 70px
  };

  const headerHeight = isContentHighlight ? getHeaderHeight() : 0;

  return (
    <>
      {/* CSS для пульсации */}
      <style>{`
        @keyframes tour-pulse {
          0%, 100% { 
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 0 4px #28CA9E, 0 0 20px rgba(40, 202, 158, 0.5);
          }
          50% { 
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 0 8px #ff6b6b, 0 0 40px rgba(255, 107, 107, 0.8);
          }
        }
        .tour-highlight-pulse {
          animation: tour-pulse 0.3s ease-in-out 2;
        }
      `}</style>

      {isContentHighlight ? (
        // Режим highlightContent: затемняем только header
        <div
          className="fixed left-0 right-0 z-[9998]"
          style={{
            top: 0,
            height: headerHeight,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            pointerEvents: "none",
          }}
        />
      ) : (
        // Обычный режим: полный оверлей
        <>
          {/* Кликабельный оверлей - блокирует все клики кроме целевого элемента */}
          <div
            className="fixed inset-0 z-[9998]"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              cursor: isClickRequired ? "not-allowed" : "default",
            }}
            onClick={handleOverlayClick}
          />

          {/* Highlight cutout с яркой рамкой для лучшей видимости */}
          <div
            className={`fixed z-[9999] rounded-lg ${isPulsing ? "tour-highlight-pulse" : ""}`}
            style={{
              top: highlightPosition.top,
              left: highlightPosition.left,
              width: highlightPosition.width,
              height: highlightPosition.height,
              boxShadow:
                "0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 0 4px #28CA9E, 0 0 20px rgba(40, 202, 158, 0.5)",
              pointerEvents: isClickRequired ? "auto" : "none",
              cursor: isClickRequired ? "pointer" : "default",
            }}
            onClick={isClickRequired ? handleTargetClick : undefined}
          />
        </>
      )}

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
          <span className="text-sm font-inter text-gray-500">
            Шаг {currentStep + 1} из {steps.length}
          </span>
          <button
            onClick={onSkip}
            className="text-sm font-inter font-medium text-gray-500 hover:text-accent hover:bg-gray-50 px-3 py-1.5 rounded-md transition-all duration-200 ease-in-out"
          >
            Пропустить
          </button>
        </div>

        {/* Content */}
        <h3 className="text-lg font-golos font-semibold text-gray-800 mb-2">
          {step.title}
        </h3>
        <p className="text-gray-600 text-sm font-inter leading-relaxed mb-4">
          {step.content}
        </p>

        {/* Click instruction for interactive steps */}
        {isClickRequired && (
          <div className="flex items-center gap-2 mb-4 p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
            <i className="pi pi-hand-pointer text-emerald-600 text-base" />
            <span className="text-sm text-emerald-700 font-inter font-medium">
              Нажмите на подсвеченный элемент
            </span>
          </div>
        )}

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
          {!isClickRequired && (
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
          )}
        </div>
      </div>
    </>
  );
};

export default OnboardingTour;
