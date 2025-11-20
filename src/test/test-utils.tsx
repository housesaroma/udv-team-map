import React from "react";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import type { RenderOptions } from "@testing-library/react";
import { vi } from "vitest";
import type { AuthContextType } from "../contexts/AuthContext";
import { AppProviders } from "../providers/AppProviders";

vi.mock("../contexts/AuthContext", () => {
  return {
    AuthProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

// Мок для AuthContext по умолчанию
const defaultAuthContextValue: AuthContextType = {
  user: null,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  getToken: () => null,
};

// Вспомогательная функция для рендеринга с провайдерами
interface AllTheProvidersProps {
  children: React.ReactNode;
  authContextValue?: AuthContextType;
}

const allTheProviders = ({
  children,
  authContextValue = defaultAuthContextValue,
}: AllTheProvidersProps) => {
  return (
    <AppProviders authContextValue={authContextValue}>{children}</AppProviders>
  );
};

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  authContextValue?: AuthContextType;
}

const customRender = (ui: ReactElement, options?: CustomRenderOptions) => {
  const { authContextValue, ...renderOptions } = options || {};
  return render(ui, {
    wrapper: ({ children }) =>
      allTheProviders({
        children,
        authContextValue,
      }),
    ...renderOptions,
  });
};

// Реэкспорт всех функций из @testing-library/react (кроме render)
export {
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
  fireEvent,
  act,
  cleanup,
} from "@testing-library/react";
export { customRender as render };
