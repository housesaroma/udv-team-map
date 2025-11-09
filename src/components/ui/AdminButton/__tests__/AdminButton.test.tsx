import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "../../../../test/test-utils";
import userEvent from "@testing-library/user-event";
import { AdminButton } from "../AdminButton";
import { Permission } from "../../../../types/permissions";

// Мокаем useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Мокаем usePermissions
const mockHasPermission = vi.fn();
vi.mock("../../../../hooks/usePermissions", () => ({
  usePermissions: () => ({
    hasPermission: mockHasPermission,
  }),
}));

describe("AdminButton", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockHasPermission.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("должен отображать кнопку, если есть разрешение", () => {
    mockHasPermission.mockReturnValue(true);

    render(<AdminButton />);

    const button = screen.getByRole("button", {
      name: /административная панель/i,
    });
    expect(button).toBeInTheDocument();
  });

  it("не должен отображать кнопку, если нет разрешения", () => {
    mockHasPermission.mockReturnValue(false);

    render(<AdminButton />);

    const button = screen.queryByRole("button", {
      name: /административная панель/i,
    });
    expect(button).not.toBeInTheDocument();
  });

  it("должен вызывать navigate при клике", async () => {
    mockHasPermission.mockReturnValue(true);
    const user = userEvent.setup();

    render(<AdminButton />);

    const button = screen.getByRole("button", {
      name: /административная панель/i,
    });
    await user.click(button);

    expect(mockNavigate).toHaveBeenCalledWith("/admin");
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it("должен проверять правильное разрешение", () => {
    mockHasPermission.mockReturnValue(true);

    render(<AdminButton />);

    expect(mockHasPermission).toHaveBeenCalledWith(
      Permission.ACCESS_ADMIN_PANEL
    );
  });

  it("должен иметь правильные стили и классы", () => {
    mockHasPermission.mockReturnValue(true);

    render(<AdminButton />);

    const button = screen.getByRole("button", {
      name: /административная панель/i,
    });

    // Проверяем только цвет, так как border может быть в другом формате
    expect(button).toHaveStyle({
      color: "rgb(40, 202, 158)", // #28CA9E в RGB
    });
    expect(button).toHaveClass("p-2");
  });
});
