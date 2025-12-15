import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Layout from "../Layout";

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

// Mock usePermissions
vi.mock("../../../hooks/usePermissions", () => ({
  usePermissions: () => ({
    userRole: "employee",
    hasPermission: () => false,
    canEditProfile: () => false,
  }),
}));

// Mock useAuth
vi.mock("../../../hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "1", firstName: "Test", lastName: "User" },
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));

describe("Layout", () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Mark tour as completed to avoid interference
    localStorageMock.setItem("udv_onboarding_completed", "true");
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders Header component", () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<div>Test Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Header should contain the logo
    expect(screen.getByAltText("UDV Team Map Logo")).toBeInTheDocument();
  });

  it("renders Outlet content", () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<div>Outlet Test Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Outlet Test Content")).toBeInTheDocument();
  });

  it("has correct structure with header and main", () => {
    const { container } = render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<div>Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Should have header
    const header = container.querySelector("header");
    expect(header).toBeInTheDocument();

    // Should have main
    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();
  });
});
