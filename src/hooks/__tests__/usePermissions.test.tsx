import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePermissions } from "../usePermissions";
import { Permission } from "../../types/permissions";
import { AuthContext } from "../../contexts/AuthContextInstance";
import type { AuthContextType } from "../../contexts/AuthContext";
import type { User } from "../../types";

// Мокаем useAuth
const mockUseAuth = vi.fn();
vi.mock("../useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("usePermissions", () => {
  const mockUser: User = {
    id: "user-1",
    firstName: "Иван",
    lastName: "Иванов",
    position: "Developer",
    department: {
      id: "it",
      name: "IT",
      color: "#3697FF",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("должен возвращать разрешения для роли employee", () => {
    localStorage.setItem("userRole", "employee");
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasPermission(Permission.VIEW_ORG_STRUCTURE)).toBe(
      true
    );
    expect(result.current.hasPermission(Permission.VIEW_OWN_PROFILE)).toBe(
      true
    );
    expect(result.current.hasPermission(Permission.ACCESS_ADMIN_PANEL)).toBe(
      false
    );
    expect(result.current.userRole).toBe("employee");
  });

  it("должен возвращать разрешения для роли hr", () => {
    localStorage.setItem("userRole", "hr");
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasPermission(Permission.ACCESS_ADMIN_PANEL)).toBe(
      true
    );
    expect(result.current.hasPermission(Permission.MODERATE_PHOTOS)).toBe(
      true
    );
    expect(result.current.hasPermission(Permission.MANAGE_USERS)).toBe(false);
    expect(result.current.userRole).toBe("hr");
  });

  it("должен возвращать разрешения для роли admin", () => {
    localStorage.setItem("userRole", "admin");
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.hasPermission(Permission.ACCESS_ADMIN_PANEL)).toBe(
      true
    );
    expect(result.current.hasPermission(Permission.MANAGE_USERS)).toBe(true);
    expect(result.current.hasPermission(Permission.MODERATE_PHOTOS)).toBe(
      true
    );
    expect(result.current.userRole).toBe("admin");
  });

  it("должен использовать employee как роль по умолчанию", () => {
    localStorage.removeItem("userRole");
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.userRole).toBe("employee");
    expect(result.current.hasPermission(Permission.ACCESS_ADMIN_PANEL)).toBe(
      false
    );
  });

  it("должен возвращать false для несуществующего разрешения", () => {
    localStorage.setItem("userRole", "employee");
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    expect(
      result.current.hasPermission("non-existent-permission" as Permission)
    ).toBe(false);
  });

  describe("hasAnyPermission", () => {
    it("должен возвращать true, если есть хотя бы одно разрешение", () => {
      localStorage.setItem("userRole", "employee");
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAnyPermission([
          Permission.ACCESS_ADMIN_PANEL,
          Permission.VIEW_ORG_STRUCTURE,
        ])
      ).toBe(true);
    });

    it("должен возвращать false, если нет ни одного разрешения", () => {
      localStorage.setItem("userRole", "employee");
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAnyPermission([
          Permission.ACCESS_ADMIN_PANEL,
          Permission.MANAGE_USERS,
        ])
      ).toBe(false);
    });
  });

  describe("hasAllPermissions", () => {
    it("должен возвращать true, если есть все разрешения", () => {
      localStorage.setItem("userRole", "admin");
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAllPermissions([
          Permission.VIEW_ORG_STRUCTURE,
          Permission.ACCESS_ADMIN_PANEL,
        ])
      ).toBe(true);
    });

    it("должен возвращать false, если нет хотя бы одного разрешения", () => {
      localStorage.setItem("userRole", "employee");
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAllPermissions([
          Permission.VIEW_ORG_STRUCTURE,
          Permission.ACCESS_ADMIN_PANEL,
        ])
      ).toBe(false);
    });
  });

  describe("canEditProfile", () => {
    it("должен разрешать редактирование собственного профиля", () => {
      localStorage.setItem("userRole", "employee");
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canEditProfile("user-1")).toBe(true);
    });

    it("должен запрещать редактирование чужого профиля для employee", () => {
      localStorage.setItem("userRole", "employee");
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canEditProfile("other-user")).toBe(false);
    });

    it("должен разрешать редактирование чужого профиля для hr", () => {
      localStorage.setItem("userRole", "hr");
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canEditProfile("other-user")).toBe(true);
    });

    it("должен возвращать false, если пользователь не авторизован", () => {
      localStorage.setItem("userRole", "employee");
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canEditProfile("user-1")).toBe(false);
    });
  });

  describe("canEditSensitiveData", () => {
    it("должен запрещать редактирование чувствительных данных собственного профиля", () => {
      localStorage.setItem("userRole", "admin");
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canEditSensitiveData("user-1")).toBe(false);
    });

    it("должен разрешать редактирование чувствительных данных чужого профиля для admin", () => {
      localStorage.setItem("userRole", "admin");
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canEditSensitiveData("other-user")).toBe(true);
    });

    it("должен запрещать редактирование чувствительных данных для employee", () => {
      localStorage.setItem("userRole", "employee");
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canEditSensitiveData("other-user")).toBe(false);
    });
  });

  describe("getEditableFields", () => {
    it("должен возвращать базовые поля для собственного профиля", () => {
      localStorage.setItem("userRole", "employee");
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermissions());

      const fields = result.current.getEditableFields("user-1");

      expect(fields.basicInfo).toContain("phone");
      expect(fields.basicInfo).toContain("email");
      expect(fields.sensitiveInfo).toHaveLength(0);
    });

    it("должен возвращать чувствительные поля для чужого профиля для admin", () => {
      localStorage.setItem("userRole", "admin");
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
      });

      const { result } = renderHook(() => usePermissions());

      const fields = result.current.getEditableFields("other-user");

      expect(fields.sensitiveInfo).toContain("firstName");
      expect(fields.sensitiveInfo).toContain("lastName");
      expect(fields.sensitiveInfo).toContain("position");
    });
  });
});

