import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "../useAuth";
import { AuthContext } from "../../contexts/AuthContextInstance";
import type { AuthContextType } from "../../contexts/AuthContext";
import type { User } from "../../types";

describe("useAuth", () => {
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

  const createWrapper = (contextValue: AuthContextType) => {
    return ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("должен возвращать контекст аутентификации", () => {
    const contextValue: AuthContextType = {
      user: mockUser,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(contextValue),
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.login).toBeDefined();
    expect(result.current.logout).toBeDefined();
  });

  it("должен возвращать null для пользователя, когда не авторизован", () => {
    const contextValue: AuthContextType = {
      user: null,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(contextValue),
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("должен показывать состояние загрузки", () => {
    const contextValue: AuthContextType = {
      user: null,
      isLoading: true,
      login: vi.fn(),
      logout: vi.fn(),
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(contextValue),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("должен вызывать функцию login из контекста", async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    const contextValue: AuthContextType = {
      user: null,
      isLoading: false,
      login: mockLogin,
      logout: vi.fn(),
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(contextValue),
    });

    await act(async () => {
      await result.current.login("test@example.com", "password123");
    });

    expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
    expect(mockLogin).toHaveBeenCalledTimes(1);
  });

  it("должен вызывать функцию logout из контекста", () => {
    const mockLogout = vi.fn();
    const contextValue: AuthContextType = {
      user: mockUser,
      isLoading: false,
      login: vi.fn(),
      logout: mockLogout,
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(contextValue),
    });

    act(() => {
      result.current.logout();
    });

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it("должен выбрасывать ошибку, если используется вне AuthProvider", () => {
    // Используем контекст без провайдера
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    
    // renderHook может перехватывать ошибки, поэтому используем try-catch
    let errorThrown = false;
    try {
      renderHook(() => useAuth(), {
        wrapper: ({ children }) => <>{children}</>, // Без AuthProvider
      });
    } catch (error) {
      errorThrown = true;
      expect((error as Error).message).toBe(
        "useAuth must be used within an AuthProvider"
      );
    }
    
    // Если ошибка не была выброшена, проверяем через result.error
    if (!errorThrown) {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <>{children}</>,
      });
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe(
        "useAuth must be used within an AuthProvider"
      );
    }
    
    consoleError.mockRestore();
  });
});

