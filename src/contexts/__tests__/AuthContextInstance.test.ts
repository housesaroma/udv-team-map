import { describe, it, expect, beforeEach } from "vitest";
import { getAuthToken, setAuthTokenGetter } from "../AuthContextInstance";

const clearTokenState = () => {
  setAuthTokenGetter(undefined);
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.removeItem("authToken");
  }
};

describe("AuthContextInstance token helpers", () => {
  beforeEach(() => {
    clearTokenState();
  });

  it("возвращает токен из пользовательского геттера", () => {
    setAuthTokenGetter(() => "custom-token");

    expect(getAuthToken()).toBe("custom-token");
  });

  it("использует localStorage, когда геттер не передан", () => {
    window.localStorage.setItem("authToken", "fallback-token");
    setAuthTokenGetter(undefined);

    expect(getAuthToken()).toBe("fallback-token");
  });

  it("возвращает null, когда localStorage недоступно", () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(
      window,
      "localStorage"
    );

    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get: () => undefined,
    });

    setAuthTokenGetter(undefined);

    expect(getAuthToken()).toBeNull();

    if (originalDescriptor) {
      Object.defineProperty(window, "localStorage", originalDescriptor);
    }
  });
});
