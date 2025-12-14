import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
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

const renderAboutPage = () => {
  return render(
    <MemoryRouter>
      <AboutPage />
    </MemoryRouter>
  );
};

describe("AboutPage", () => {
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
      expect(screen.getByText("Ctrl + +")).toBeInTheDocument();
      expect(screen.getByText("Ctrl + -")).toBeInTheDocument();
      expect(screen.getByText("Ctrl + 0")).toBeInTheDocument();
      expect(screen.getByText("Увеличить масштаб")).toBeInTheDocument();
    });
  });

  describe("Tab navigation", () => {
    it("shows training tab as disabled", () => {
      renderAboutPage();
      const trainingButton = screen.getByRole("button", { name: /Обучение/ });
      expect(trainingButton).toBeDisabled();
    });

    it("keeps info tab active when clicking disabled training tab", () => {
      renderAboutPage();
      const trainingButton = screen.getByRole("button", { name: /Обучение/ });
      fireEvent.click(trainingButton);

      // Info content should still be visible
      expect(screen.getByText("Основные возможности")).toBeInTheDocument();
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
    it("renders training content with placeholder message", () => {
      render(<TrainingContent />);
      expect(screen.getByText("Раздел в разработке")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Материалы по обучению работе с системой скоро будут доступны"
        )
      ).toBeInTheDocument();
    });
  });
});
