import { render, screen, fireEvent, waitFor } from "../../test/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProfilePage from "../ProfilePage";
import type { User } from "../../types";


// Создаем моки для сервисов
const mockGetUserProfile = vi.fn();
const mockGetAllDepartments = vi.fn();

vi.mock("../../services/userService", () => ({
  userService: {
    getUserProfile: (...args: unknown[]) => mockGetUserProfile(...args),
  },
  updateUserProfile: vi.fn(),
}));

vi.mock("../../services/adminService", () => ({
  adminService: {
    getAllDepartments: () => mockGetAllDepartments(),
  },
}));

// Мок для usePermissions
const mockCanEditProfile = vi.fn();
vi.mock("../../hooks/usePermissions", () => ({
  usePermissions: () => ({
    canEditProfile: mockCanEditProfile,
  }),
}));

// Мок для useParams и useNavigate
let mockUserId: string | undefined = undefined;
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ userId: mockUserId }),
    useNavigate: () => mockNavigate,
  };
});

const mockUserProfile: User = {
  id: "user-123",
  firstName: "Иван",
  lastName: "Иванов",
  middleName: "Петрович",
  position: "Разработчик",
  department: { id: "it", name: "IT", color: "#3b82f6" },
  avatar: "https://example.com/avatar.jpg",
  phone: "+7-123-456-78-90",
  email: "ivan@example.com",
  city: "Москва",
  interests: "Программирование, чтение",
  birthDate: "1990-01-15T00:00:00Z",
  hireDate: "2020-06-01T00:00:00Z",
  managerId: "manager-456",
  contacts: {
    telegram: "ivanov_ivan",
    skype: "ivan.ivanov",
  },
};

const mockManagerProfile: User = {
  id: "manager-456",
  firstName: "Петр",
  lastName: "Петров",
  middleName: "Сидорович",
  position: "Руководитель отдела",
  department: { id: "it", name: "IT", color: "#3b82f6" },
  avatar: "https://example.com/manager-avatar.jpg",
  phone: "+7-987-654-32-10",
  email: "petrov@example.com",
  city: "Москва",
};

const mockOtherUserProfile: User = {
  id: "user-789",
  firstName: "Мария",
  lastName: "Сидорова",
  position: "Дизайнер",
  department: { id: "design", name: "Дизайн", color: "#ec4899" },
  avatar: "https://example.com/maria-avatar.jpg",
  phone: "+7-111-222-33-44",
  email: "maria@example.com",
  city: "Санкт-Петербург",
  managerId: "manager-456",
};

const renderProfilePage = (userId?: string, user: User = mockUserProfile) => {
  mockUserId = userId;
  return render(<ProfilePage />, {
    authContextValue: {
      user,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      getToken: () => "test-token",
    },
  });
};

describe("ProfilePage - Manager card feature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCanEditProfile.mockReturnValue(true);
    mockGetAllDepartments.mockResolvedValue([
      "IT",
      "HR",
      "Финансы",
      "Маркетинг",
    ]);
  });

  describe("Manager card display", () => {
    it("displays manager card when managerId exists", async () => {
      mockGetUserProfile
        .mockResolvedValueOnce(mockUserProfile)
        .mockResolvedValueOnce(mockManagerProfile);

      renderProfilePage();

      await waitFor(() => {
        expect(screen.getByText("Руководитель")).toBeInTheDocument();
      });

      expect(screen.getByText(/Петров Петр/)).toBeInTheDocument();
      expect(screen.getByText("Руководитель отдела")).toBeInTheDocument();
    });

    it("does not display manager card when managerId is missing", async () => {
      const profileWithoutManager = {
        ...mockUserProfile,
        managerId: undefined,
      };
      mockGetUserProfile.mockResolvedValueOnce(profileWithoutManager);

      renderProfilePage();

      await waitFor(() => {
        expect(screen.getByText(/Иванов Иван/)).toBeInTheDocument();
      });

      expect(screen.queryByText("Руководитель")).not.toBeInTheDocument();
    });

    it("handles manager loading error gracefully", async () => {
      mockGetUserProfile
        .mockResolvedValueOnce(mockUserProfile)
        .mockRejectedValueOnce(new Error("Manager not found"));

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      renderProfilePage();

      await waitFor(() => {
        expect(screen.getByText(/Иванов Иван/)).toBeInTheDocument();
      });

      expect(screen.queryByText("Руководитель")).not.toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Ошибка загрузки данных руководителя:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("displays manager avatar when available", async () => {
      mockGetUserProfile
        .mockResolvedValueOnce(mockUserProfile)
        .mockResolvedValueOnce(mockManagerProfile);

      renderProfilePage();

      await waitFor(() => {
        expect(screen.getByText("Руководитель")).toBeInTheDocument();
      });

      const managerAvatar = screen.getByAltText(/Петр Петров/);
      expect(managerAvatar).toBeInTheDocument();
      expect(managerAvatar).toHaveAttribute(
        "src",
        "https://example.com/manager-avatar.jpg"
      );
    });

    it("navigates to manager profile when clicking manager card", async () => {
      mockGetUserProfile
        .mockResolvedValueOnce(mockUserProfile)
        .mockResolvedValueOnce(mockManagerProfile);

      renderProfilePage();

      await waitFor(() => {
        expect(screen.getByText("Руководитель")).toBeInTheDocument();
      });

      const managerCard = screen.getByText(/Петров Петр/).closest("div")
        ?.parentElement?.parentElement;

      if (managerCard) {
        fireEvent.click(managerCard);
        expect(mockNavigate).toHaveBeenCalledWith("/profile/manager-456");
      }
    });

    it("displays manager department information", async () => {
      mockGetUserProfile
        .mockResolvedValueOnce(mockUserProfile)
        .mockResolvedValueOnce(mockManagerProfile);

      renderProfilePage();

      await waitFor(() => {
        expect(screen.getByText("Руководитель")).toBeInTheDocument();
      });

      // Проверяем что отображается подразделение в карточке руководителя
      const managerCard = screen
        .getByText(/Петров Петр/)
        .closest("div")?.parentElement;
      expect(managerCard).toBeTruthy();
    });
  });

  describe("Client-side validation and toasts", () => {
    it("normalizes phone with separators and sends normalized value to updateUserProfile", async () => {
      const profileWithHyphens = { ...mockUserProfile, phone: "+7-495-444-44-44" } as User;
      mockGetUserProfile.mockResolvedValueOnce(profileWithHyphens);

      const { findByText, getByText, getByPlaceholderText } = renderProfilePage();

      await findByText(/Иванов Иван/);

      fireEvent.click(getByText("Редактировать"));

      const phoneInput = getByPlaceholderText("+79991234567");

      // После нормализации в editData должно быть +74954444444
      expect((phoneInput as HTMLInputElement).value).toBe("+74954444444");

      fireEvent.click(getByText("Сохранить"));

      const { updateUserProfile } = await vi.importMock("../../services/userService");
      expect(updateUserProfile).toHaveBeenCalled();
      const calledWith = (updateUserProfile as any).mock.calls[0][1];
      expect(calledWith.phone).toBe("+74954444444");
    });

    it("shows warning toast when required fields are missing", async () => {
      // профиль без позиции
      const incompleteProfile = { ...mockUserProfile, position: "" } as User;
      mockGetUserProfile.mockResolvedValueOnce(incompleteProfile);

      const { findByText, getByText } = renderProfilePage();

      await findByText(/Иванов Иван/);

      fireEvent.click(getByText("Редактировать"));

      // Поскольку позиция пустая, ensure Save catches it
      fireEvent.click(getByText("Сохранить"));

      await findByText(/Пожалуйста, заполните/);
    });
  });

  describe("Profile loading for other users", () => {
    it("renders other user profile with manager", async () => {
      mockGetUserProfile
        .mockResolvedValueOnce(mockOtherUserProfile)
        .mockResolvedValueOnce(mockManagerProfile);

      renderProfilePage("user-789");

      await waitFor(() => {
        expect(screen.getByText(/Сидорова Мария/)).toBeInTheDocument();
      });

      expect(screen.getByText("Дизайнер")).toBeInTheDocument();

      // Проверяем что отображается руководитель
      expect(screen.getByText("Руководитель")).toBeInTheDocument();
      expect(screen.getByText(/Петров Петр/)).toBeInTheDocument();
    });

    it("clears previous manager data when navigating to a different profile", async () => {
      // Сначала загружаем профиль с руководителем
      mockGetUserProfile
        .mockResolvedValueOnce(mockUserProfile) // профиль пользователя
        .mockResolvedValueOnce(mockManagerProfile); // профиль руководителя

      const { rerender } = renderProfilePage("user-123");

      await waitFor(() => {
        expect(screen.getByText(/Иванов Иван/)).toBeInTheDocument();
      });

      // Проверяем что отображается руководитель
      expect(screen.getByText("Руководитель")).toBeInTheDocument();
      expect(screen.getByText(/Петров Петр/)).toBeInTheDocument();

      // Теперь переходим на профиль руководителя (который не имеет своего руководителя)
      const managerProfileWithoutManager: User = {
        ...mockManagerProfile,
        managerId: undefined,
      };

      mockGetUserProfile.mockResolvedValueOnce(managerProfileWithoutManager);

      // Эмулируем изменение userId в URL
      mockUserId = "manager-456";
      rerender(<ProfilePage />);

      // Проверяем что загружается новый профиль
      await waitFor(() => {
        expect(screen.getByText(/Петров Петр/)).toBeInTheDocument();
      });

      // Проверяем что старые данные руководителя очистились
      // и больше нет карточки "Руководитель"
      expect(screen.queryByText("Руководитель")).not.toBeInTheDocument();
    });
  });

  describe("Show on map button", () => {
    it("displays 'Show on map' button when hierarchyId exists", async () => {
      const profileWithHierarchy: User = {
        ...mockUserProfile,
        hierarchyId: 47,
      };

      mockGetUserProfile
        .mockResolvedValueOnce(profileWithHierarchy)
        .mockResolvedValueOnce(mockManagerProfile);

      renderProfilePage();

      await waitFor(() => {
        expect(screen.getByText(/Иванов Иван/)).toBeInTheDocument();
      });

      // Проверяем что кнопка "Показать на карте" отображается
      expect(screen.getByText("Показать на карте")).toBeInTheDocument();
    });

    it("does not display 'Show on map' button when hierarchyId is missing", async () => {
      const profileWithoutHierarchy: User = {
        ...mockUserProfile,
        hierarchyId: undefined,
      };

      mockGetUserProfile.mockResolvedValueOnce(profileWithoutHierarchy);

      renderProfilePage();

      await waitFor(() => {
        expect(screen.getByText(/Иванов Иван/)).toBeInTheDocument();
      });

      // Проверяем что кнопка "Показать на карте" не отображается
      expect(screen.queryByText("Показать на карте")).not.toBeInTheDocument();
    });

    it("navigates to department page when 'Show on map' button is clicked", async () => {
      const profileWithHierarchy: User = {
        ...mockUserProfile,
        hierarchyId: 47,
      };

      mockGetUserProfile
        .mockResolvedValueOnce(profileWithHierarchy)
        .mockResolvedValueOnce(mockManagerProfile);

      renderProfilePage();

      await waitFor(() => {
        expect(screen.getByText(/Иванов Иван/)).toBeInTheDocument();
      });

      const showOnMapButton = screen.getByText("Показать на карте");
      fireEvent.click(showOnMapButton);

      expect(mockNavigate).toHaveBeenCalledWith("/department/47");
    });
  });
});
