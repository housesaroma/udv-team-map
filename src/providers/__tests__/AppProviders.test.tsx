import React, { useContext } from "react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppProviders } from "../AppProviders";
import { AuthContext } from "../../contexts/AuthContextInstance";
import type { AuthContextType } from "../../contexts/AuthContext";

vi.mock("react-router-dom", () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="browser-router">{children}</div>
  ),
}));

vi.mock("react-redux", () => ({
  Provider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="redux-provider">{children}</div>
  ),
}));

vi.mock("primereact/api", () => ({
  PrimeReactProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="primereact-provider">{children}</div>
  ),
}));

const mockAuthProvider = vi.hoisted(() =>
  vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ))
);

vi.mock("../../contexts/AuthContext", () => ({
  AuthProvider: mockAuthProvider,
}));

describe("AppProviders", () => {
  beforeEach(() => {
    mockAuthProvider.mockClear();
  });

  it("использует AuthProvider по умолчанию, когда authContextValue не передан", () => {
    render(
      <AppProviders>
        <div data-testid="child">content</div>
      </AppProviders>
    );

    expect(screen.getByTestId("auth-provider")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(mockAuthProvider).toHaveBeenCalledTimes(1);
  });

  it("оборачивает детей в предоставленный authContextValue, минуя AuthProvider", () => {
    const customContext: AuthContextType = {
      user: null,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      getToken: () => "token",
    };

    const Consumer = () => {
      const ctx = useContext(AuthContext);
      if (!ctx) {
        return <div data-testid="ctx-token">no-context</div>;
      }

      return <div data-testid="ctx-token">{ctx.getToken()}</div>;
    };

    render(
      <AppProviders authContextValue={customContext}>
        <Consumer />
      </AppProviders>
    );

    expect(screen.getByTestId("ctx-token")).toHaveTextContent("token");
    expect(screen.queryByTestId("auth-provider")).not.toBeInTheDocument();
    expect(mockAuthProvider).not.toHaveBeenCalled();
  });
});
