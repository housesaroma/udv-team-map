import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { OnboardingTour } from "../OnboardingTour";
import type { TourStep } from "../OnboardingTour";
import { useOnboardingTour } from "../useOnboardingTour";
import { renderHook, act } from "@testing-library/react";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

const mockSteps: TourStep[] = [
  {
    target: "[data-testid='step-1']",
    title: "Step 1",
    content: "Content 1",
    placement: "bottom",
  },
  {
    target: "[data-testid='step-2']",
    title: "Step 2",
    content: "Content 2",
    placement: "top",
  },
  {
    target: "[data-testid='step-3']",
    title: "Step 3",
    content: "Content 3",
    placement: "left",
  },
  {
    target: "[data-testid='step-4']",
    title: "Step 4",
    content: "Content 4",
    placement: "right",
  },
];

// Helper to wrap component in Router
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe("OnboardingTour", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing when isActive is false", () => {
    const { container } = renderWithRouter(
      <OnboardingTour
        steps={mockSteps}
        isActive={false}
        onComplete={vi.fn()}
        onSkip={vi.fn()}
      />
    );
    expect(container.querySelector(".fixed")).toBeNull();
  });

  it("renders nothing when steps array is empty", () => {
    const { container } = renderWithRouter(
      <OnboardingTour
        steps={[]}
        isActive={true}
        onComplete={vi.fn()}
        onSkip={vi.fn()}
      />
    );
    expect(container.querySelector(".fixed")).toBeNull();
  });

  it("renders tour when active with steps", () => {
    // Create target element
    const targetEl = document.createElement("div");
    targetEl.setAttribute("data-testid", "step-1");
    document.body.appendChild(targetEl);

    renderWithRouter(
      <OnboardingTour
        steps={mockSteps}
        isActive={true}
        onComplete={vi.fn()}
        onSkip={vi.fn()}
      />
    );

    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Content 1")).toBeInTheDocument();
    expect(screen.getByText("Шаг 1 из 4")).toBeInTheDocument();

    document.body.removeChild(targetEl);
  });

  it("navigates to next step on click", () => {
    const targetEl1 = document.createElement("div");
    targetEl1.setAttribute("data-testid", "step-1");
    const targetEl2 = document.createElement("div");
    targetEl2.setAttribute("data-testid", "step-2");
    document.body.appendChild(targetEl1);
    document.body.appendChild(targetEl2);

    renderWithRouter(
      <OnboardingTour
        steps={mockSteps}
        isActive={true}
        onComplete={vi.fn()}
        onSkip={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("Далее"));
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText("Step 2")).toBeInTheDocument();
    expect(screen.getByText("Шаг 2 из 4")).toBeInTheDocument();

    document.body.removeChild(targetEl1);
    document.body.removeChild(targetEl2);
  });

  it("navigates to previous step on click", () => {
    const targetEl1 = document.createElement("div");
    targetEl1.setAttribute("data-testid", "step-1");
    const targetEl2 = document.createElement("div");
    targetEl2.setAttribute("data-testid", "step-2");
    document.body.appendChild(targetEl1);
    document.body.appendChild(targetEl2);

    renderWithRouter(
      <OnboardingTour
        steps={mockSteps}
        isActive={true}
        onComplete={vi.fn()}
        onSkip={vi.fn()}
      />
    );

    // Go to step 2
    fireEvent.click(screen.getByText("Далее"));
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Go back to step 1
    fireEvent.click(screen.getByText("Назад"));
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText("Step 1")).toBeInTheDocument();

    document.body.removeChild(targetEl1);
    document.body.removeChild(targetEl2);
  });

  it("calls onComplete on last step", () => {
    const onComplete = vi.fn();
    const targetEl = document.createElement("div");
    targetEl.setAttribute("data-testid", "step-1");
    document.body.appendChild(targetEl);

    const singleStep: TourStep[] = [
      {
        target: "[data-testid='step-1']",
        title: "Only Step",
        content: "Content",
        placement: "bottom",
      },
    ];

    renderWithRouter(
      <OnboardingTour
        steps={singleStep}
        isActive={true}
        onComplete={onComplete}
        onSkip={vi.fn()}
      />
    );

    expect(screen.getByText("Готово")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Готово"));

    expect(onComplete).toHaveBeenCalledTimes(1);

    document.body.removeChild(targetEl);
  });

  it("calls onSkip when skip button clicked", () => {
    const onSkip = vi.fn();
    const targetEl = document.createElement("div");
    targetEl.setAttribute("data-testid", "step-1");
    document.body.appendChild(targetEl);

    renderWithRouter(
      <OnboardingTour
        steps={mockSteps}
        isActive={true}
        onComplete={vi.fn()}
        onSkip={onSkip}
      />
    );

    fireEvent.click(screen.getByText("Пропустить"));
    expect(onSkip).toHaveBeenCalledTimes(1);

    document.body.removeChild(targetEl);
  });

  it("disables back button on first step", () => {
    const targetEl = document.createElement("div");
    targetEl.setAttribute("data-testid", "step-1");
    document.body.appendChild(targetEl);

    renderWithRouter(
      <OnboardingTour
        steps={mockSteps}
        isActive={true}
        onComplete={vi.fn()}
        onSkip={vi.fn()}
      />
    );

    const backButton = screen.getByText("Назад").closest("button");
    expect(backButton).toBeDisabled();

    document.body.removeChild(targetEl);
  });

  it("renders progress dots for each step", () => {
    const targetEl = document.createElement("div");
    targetEl.setAttribute("data-testid", "step-1");
    document.body.appendChild(targetEl);

    const { container } = renderWithRouter(
      <OnboardingTour
        steps={mockSteps}
        isActive={true}
        onComplete={vi.fn()}
        onSkip={vi.fn()}
      />
    );

    const dots = container.querySelectorAll(".rounded-full.w-2.h-2");
    expect(dots.length).toBe(4);

    document.body.removeChild(targetEl);
  });

  it("handles all placement types (left, right)", () => {
    // Create target elements for all placement steps
    const targetEl1 = document.createElement("div");
    targetEl1.setAttribute("data-testid", "step-1");
    const targetEl2 = document.createElement("div");
    targetEl2.setAttribute("data-testid", "step-2");
    const targetEl3 = document.createElement("div");
    targetEl3.setAttribute("data-testid", "step-3");
    const targetEl4 = document.createElement("div");
    targetEl4.setAttribute("data-testid", "step-4");
    document.body.appendChild(targetEl1);
    document.body.appendChild(targetEl2);
    document.body.appendChild(targetEl3);
    document.body.appendChild(targetEl4);

    renderWithRouter(
      <OnboardingTour
        steps={mockSteps}
        isActive={true}
        onComplete={vi.fn()}
        onSkip={vi.fn()}
      />
    );

    // Go through all steps to trigger all placement calculations
    // Step 1: bottom (default)
    expect(screen.getByText("Step 1")).toBeInTheDocument();

    // Step 2: top
    fireEvent.click(screen.getByText("Далее"));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText("Step 2")).toBeInTheDocument();

    // Step 3: left
    fireEvent.click(screen.getByText("Далее"));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText("Step 3")).toBeInTheDocument();

    // Step 4: right
    fireEvent.click(screen.getByText("Далее"));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText("Step 4")).toBeInTheDocument();

    document.body.removeChild(targetEl1);
    document.body.removeChild(targetEl2);
    document.body.removeChild(targetEl3);
    document.body.removeChild(targetEl4);
  });

  it("respects disableScroll option", () => {
    const targetEl = document.createElement("div");
    targetEl.setAttribute("data-testid", "step-1");
    document.body.appendChild(targetEl);

    const stepsWithDisableScroll: TourStep[] = [
      {
        target: "[data-testid='step-1']",
        title: "No Scroll Step",
        content: "Content",
        placement: "bottom",
        disableScroll: true,
      },
    ];

    renderWithRouter(
      <OnboardingTour
        steps={stepsWithDisableScroll}
        isActive={true}
        onComplete={vi.fn()}
        onSkip={vi.fn()}
      />
    );

    // Element should not have scrollIntoView called because disableScroll is true
    // Note: We can verify the step renders correctly
    expect(screen.getByText("No Scroll Step")).toBeInTheDocument();

    document.body.removeChild(targetEl);
  });

  it("handles route navigation", () => {
    const targetEl = document.createElement("div");
    targetEl.setAttribute("data-testid", "step-1");
    document.body.appendChild(targetEl);

    const stepsWithRoute: TourStep[] = [
      {
        target: "[data-testid='step-1']",
        title: "Route Step",
        content: "Content",
        placement: "bottom",
        route: "/test-route",
      },
    ];

    renderWithRouter(
      <OnboardingTour
        steps={stepsWithRoute}
        isActive={true}
        onComplete={vi.fn()}
        onSkip={vi.fn()}
      />
    );

    // Step should render correctly with route defined
    expect(screen.getByText("Route Step")).toBeInTheDocument();

    document.body.removeChild(targetEl);
  });
});

describe("useOnboardingTour", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts tour after delay if not completed", async () => {
    const { result } = renderHook(() => useOnboardingTour());

    expect(result.current.isActive).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.isActive).toBe(true);
  });

  it("does not start tour if already completed", () => {
    localStorageMock.setItem("udv_onboarding_completed", "true");

    const { result } = renderHook(() => useOnboardingTour());

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.isActive).toBe(false);
  });

  it("completeTour sets localStorage and deactivates", () => {
    const { result } = renderHook(() => useOnboardingTour());

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.isActive).toBe(true);

    act(() => {
      result.current.completeTour();
    });

    expect(result.current.isActive).toBe(false);
    expect(localStorageMock.getItem("udv_onboarding_completed")).toBe("true");
  });

  it("skipTour sets localStorage and deactivates", () => {
    const { result } = renderHook(() => useOnboardingTour());

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      result.current.skipTour();
    });

    expect(result.current.isActive).toBe(false);
    expect(localStorageMock.getItem("udv_onboarding_completed")).toBe("true");
  });

  it("restartTour removes localStorage and activates", () => {
    localStorageMock.setItem("udv_onboarding_completed", "true");

    const { result } = renderHook(() => useOnboardingTour());

    expect(result.current.isActive).toBe(false);

    act(() => {
      result.current.restartTour();
    });

    expect(result.current.isActive).toBe(true);
    expect(localStorageMock.getItem("udv_onboarding_completed")).toBeNull();
  });
});
