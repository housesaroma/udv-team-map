import React from "react";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import type { RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { PrimeReactProvider } from "primereact/api";
import { vi } from "vitest";
import { store } from "../stores";
import { AuthContext } from "../contexts/AuthContextInstance";
import type { AuthContextType } from "../contexts/AuthContext";

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
    <Provider store={store}>
      <AuthContext.Provider value={authContextValue}>
        <PrimeReactProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </PrimeReactProvider>
      </AuthContext.Provider>
    </Provider>
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
