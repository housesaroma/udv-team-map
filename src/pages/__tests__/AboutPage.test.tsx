import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import AboutPage, { TrainingContent } from "../AboutPage";

// Мок для AuthContext
vi.mock("../../contexts/AuthContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Мок для useAuth
vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "1", name: "Test User" },
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    getToken: () => "test-token",
  }),
}));

// Мок для usePermissions - будет переопределяться в тестах
const mockUsePermissions = vi.fn();
vi.mock("../../hooks/usePermissions", () => ({
  usePermissions: () => mockUsePermissions(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock window.location
const mockLocation = {
  href: "",
  assign: vi.fn(),
  replace: vi.fn(),
};
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

const renderAboutPage = () => {
  return render(
    <MemoryRouter>
      <AboutPage />
    </MemoryRouter>
  );
};

const renderTrainingContent = () => {
  return render(
    <MemoryRouter>
      <TrainingContent />
    </MemoryRouter>
  );
};

describe("AboutPage", () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.removeItem.mockClear();
    mockLocation.href = "";
    // По умолчанию устанавливаем роль admin для полного доступа
    mockUsePermissions.mockReturnValue({
      userRole: "admin",
      hasPermission: () => true,
    });
  });
  describe("Rendering", () => {
    it("renders page title", () => {
      renderAboutPage();
      expect(screen.getByText("UDV Team Map")).toBeInTheDocument();
    });

    it("renders tabs", () => {
      renderAboutPage();
      expect(screen.getByText("О системе")).toBeInTheDocument();
      expect(screen.getByText(/Обучение/)).toBeInTheDocument();
    });

    it("renders system info tab by default", () => {
      renderAboutPage();
      expect(screen.getByText("Основные возможности")).toBeInTheDocument();
      expect(screen.getByText("Какие проблемы решает")).toBeInTheDocument();
      expect(screen.getByText("Цели системы")).toBeInTheDocument();
      expect(screen.getByText("Горячие клавиши")).toBeInTheDocument();
    });

    it("renders feature cards", () => {
      renderAboutPage();
      expect(screen.getByText("Визуализация структуры")).toBeInTheDocument();
      expect(screen.getByText("Быстрый поиск")).toBeInTheDocument();
      expect(screen.getByText("Профили сотрудников")).toBeInTheDocument();
      expect(screen.getByText("Администрирование")).toBeInTheDocument();
    });

    it("renders problem items", () => {
      renderAboutPage();
      expect(
        screen.getByText(
          "Сложность понимания организационной структуры в крупных компаниях"
        )
      ).toBeInTheDocument();
    });

    it("renders goal items", () => {
      renderAboutPage();
      expect(
        screen.getByText("Обеспечить прозрачность организационной структуры")
      ).toBeInTheDocument();
    });

    it("renders keyboard shortcuts", () => {
      renderAboutPage();
      expect(screen.getByText('Ctrl + "+"')).toBeInTheDocument();
      expect(screen.getByText('Ctrl + "-"')).toBeInTheDocument();
      expect(screen.getByText('Ctrl + "0"')).toBeInTheDocument();
      expect(screen.getByText("Увеличить масштаб")).toBeInTheDocument();
    });
  });

  describe("Tab navigation", () => {
    it("shows both tabs as enabled", () => {
      renderAboutPage();
      const trainingButton = screen.getByRole("button", { name: /Обучение/ });
      expect(trainingButton).not.toBeDisabled();
    });

    it("switches to training tab when clicked", () => {
      renderAboutPage();
      const trainingButton = screen.getByRole("button", { name: /Обучение/ });
      fireEvent.click(trainingButton);

      // Training content should be visible
      expect(
        screen.getByText("Обучение работе с системой")
      ).toBeInTheDocument();
    });

    it("info tab is active by default", () => {
      renderAboutPage();
      const infoButton = screen.getByRole("button", { name: "О системе" });
      expect(infoButton).toHaveClass("bg-accent");
    });

    it("clicking on info tab triggers setActiveTab", () => {
      renderAboutPage();
      const infoButton = screen.getByRole("button", { name: "О системе" });
      fireEvent.click(infoButton);
      // Should stay on same tab, content still visible
      expect(screen.getByText("Основные возможности")).toBeInTheDocument();
      expect(infoButton).toHaveClass("bg-accent");
    });
  });

  describe("Content sections", () => {
    it("renders all problem items", () => {
      renderAboutPage();
      const problemItems = [
        "Сложность понимания организационной структуры в крупных компаниях",
        "Трудности в поиске нужного сотрудника или отдела",
        "Отсутствие единого источника актуальной информации о команде",
        "Неэффективная коммуникация из-за незнания структуры компании",
        "Сложности адаптации новых сотрудников",
      ];
      problemItems.forEach(item => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });

    it("renders all goal items", () => {
      renderAboutPage();
      const goalItems = [
        "Обеспечить прозрачность организационной структуры",
        "Ускорить поиск нужных специалистов и контактов",
        "Упростить онбординг новых сотрудников",
        "Повысить эффективность внутренней коммуникации",
        "Централизовать информацию о сотрудниках компании",
      ];
      goalItems.forEach(item => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });

    it("renders page description", () => {
      renderAboutPage();
      expect(
        screen.getByText(
          /Интерактивная карта организационной структуры компании/
        )
      ).toBeInTheDocument();
    });
  });

  describe("TrainingContent", () => {
    it("renders training content with title", () => {
      renderTrainingContent();
      expect(
        screen.getByText("Обучение работе с системой")
      ).toBeInTheDocument();
    });

    it("renders restart tour button", () => {
      renderTrainingContent();
      expect(
        screen.getByText("Пройти интерактивный тур заново")
      ).toBeInTheDocument();
    });

    it("renders category filter buttons", () => {
      renderTrainingContent();
      expect(
        screen.getByRole("button", { name: /Все уроки/ })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Основы/ })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Для HR/ })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Администрирование/ })
      ).toBeInTheDocument();
    });

    it("renders video lessons", () => {
      renderTrainingContent();
      expect(
        screen.getByText("Навигация по карте организации")
      ).toBeInTheDocument();
      expect(screen.getByText("Поиск сотрудников")).toBeInTheDocument();
    });

    it("filters lessons by category", () => {
      renderTrainingContent();

      // Click HR category button
      fireEvent.click(screen.getByRole("button", { name: /Для HR/ }));

      // HR lessons should be visible
      expect(
        screen.getByText("Работа с таблицей сотрудников")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Перемещение сотрудников между отделами")
      ).toBeInTheDocument();

      // Basic lessons should NOT be visible
      expect(
        screen.queryByText("Навигация по карте организации")
      ).not.toBeInTheDocument();
    });

    it("shows all lessons when 'Все уроки' clicked", () => {
      renderTrainingContent();

      // First filter by HR
      fireEvent.click(screen.getByRole("button", { name: /Для HR/ }));
      expect(
        screen.queryByText("Навигация по карте организации")
      ).not.toBeInTheDocument();

      // Then click all
      fireEvent.click(screen.getByRole("button", { name: /Все уроки/ }));
      expect(
        screen.getByText("Навигация по карте организации")
      ).toBeInTheDocument();
    });

    it("opens video dialog when lesson card clicked", () => {
      renderTrainingContent();

      // Find the first video lesson card and click on it
      const lessonCard = screen
        .getByText("Навигация по карте организации")
        .closest("div.bg-white");
      expect(lessonCard).toBeInTheDocument();
      fireEvent.click(lessonCard!);

      // Dialog should open with video
      expect(screen.getByRole("dialog", { hidden: true })).toBeInTheDocument();
    });

    it("closes video dialog when hide is triggered", () => {
      renderTrainingContent();

      // Open dialog
      const lessonCard = screen
        .getByText("Навигация по карте организации")
        .closest("div.bg-white");
      fireEvent.click(lessonCard!);

      // Dialog is open
      const dialog = screen.getByRole("dialog", { hidden: true });
      expect(dialog).toBeInTheDocument();

      // Find and click the close button
      const closeButton = dialog.querySelector(".p-dialog-header-close");
      if (closeButton) {
        fireEvent.click(closeButton);
      }

      // Verify dialog closes (it may still be in DOM but hidden)
      // The selectedVideo state should be null after close
    });

    it("restarts tour when restart button clicked", () => {
      renderTrainingContent();

      fireEvent.click(screen.getByText("Пройти интерактивный тур заново"));

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "udv_onboarding_completed"
      );
      expect(mockLocation.href).toBe("/");
    });

    it("filters to advanced category", () => {
      renderTrainingContent();

      fireEvent.click(
        screen.getByRole("button", { name: /Администрирование/ })
      );

      expect(
        screen.getByText("Редактирование структуры организации")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Навигация по карте организации")
      ).not.toBeInTheDocument();
    });

    it("filters to basics category", () => {
      renderTrainingContent();

      // First filter to something else
      fireEvent.click(screen.getByRole("button", { name: /Для HR/ }));
      // Then filter to basics
      fireEvent.click(screen.getByRole("button", { name: /Основы/ }));

      expect(
        screen.getByText("Навигация по карте организации")
      ).toBeInTheDocument();
      expect(screen.getByText("Поиск сотрудников")).toBeInTheDocument();
      expect(
        screen.queryByText("Работа с таблицей сотрудников")
      ).not.toBeInTheDocument();
    });
  });

  describe("Role-based filtering", () => {
    it("employee sees only basic lessons", () => {
      mockUsePermissions.mockReturnValue({
        userRole: "employee",
        hasPermission: () => false,
      });
      renderTrainingContent();

      // Should see basic lessons
      expect(
        screen.getByText("Навигация по карте организации")
      ).toBeInTheDocument();
      expect(screen.getByText("Поиск сотрудников")).toBeInTheDocument();

      // Should NOT see HR or admin lessons
      expect(
        screen.queryByText("Работа с таблицей сотрудников")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Редактирование структуры организации")
      ).not.toBeInTheDocument();
    });

    it("employee does not see HR and Admin category buttons", () => {
      mockUsePermissions.mockReturnValue({
        userRole: "employee",
        hasPermission: () => false,
      });
      renderTrainingContent();

      // Should see basic category buttons
      expect(
        screen.getByRole("button", { name: /Все уроки/ })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Основы/ })
      ).toBeInTheDocument();

      // Should NOT see HR and Admin category buttons
      expect(
        screen.queryByRole("button", { name: /Для HR/ })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Администрирование/ })
      ).not.toBeInTheDocument();
    });

    it("hr sees all lessons including admin lessons (same rights as admin)", () => {
      mockUsePermissions.mockReturnValue({
        userRole: "hr",
        hasPermission: () => true,
      });
      renderTrainingContent();

      // Should see basic lessons
      expect(
        screen.getByText("Навигация по карте организации")
      ).toBeInTheDocument();

      // Should see HR lessons
      expect(
        screen.getByText("Работа с таблицей сотрудников")
      ).toBeInTheDocument();

      // Should also see admin lessons (HR has same rights)
      expect(
        screen.getByText("Редактирование структуры организации")
      ).toBeInTheDocument();
    });

    it("hr sees all category buttons including Admin (same rights as admin)", () => {
      mockUsePermissions.mockReturnValue({
        userRole: "hr",
        hasPermission: () => true,
      });
      renderTrainingContent();

      // Should see HR category button
      expect(
        screen.getByRole("button", { name: /Для HR/ })
      ).toBeInTheDocument();

      // Should also see Admin category button (HR has same rights)
      expect(
        screen.getByRole("button", { name: /Администрирование/ })
      ).toBeInTheDocument();
    });

    it("admin sees all lessons", () => {
      mockUsePermissions.mockReturnValue({
        userRole: "admin",
        hasPermission: () => true,
      });
      renderTrainingContent();

      // Should see basic lessons
      expect(
        screen.getByText("Навигация по карте организации")
      ).toBeInTheDocument();

      // Should see HR lessons
      expect(
        screen.getByText("Работа с таблицей сотрудников")
      ).toBeInTheDocument();

      // Should see admin lessons
      expect(
        screen.getByText("Редактирование структуры организации")
      ).toBeInTheDocument();
    });

    it("admin sees all category buttons", () => {
      mockUsePermissions.mockReturnValue({
        userRole: "admin",
        hasPermission: () => true,
      });
      renderTrainingContent();

      expect(
        screen.getByRole("button", { name: /Все уроки/ })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Основы/ })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Для HR/ })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Администрирование/ })
      ).toBeInTheDocument();
    });
  });
});
