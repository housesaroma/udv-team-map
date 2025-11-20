import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PrimeReactProvider } from "primereact/api";
import type { ReactNode } from "react";
import { store } from "../stores";
import { AuthProvider } from "../contexts/AuthContext";
import { AuthContext } from "../contexts/AuthContextInstance";
import type { AuthContextType } from "../contexts/AuthContext";

interface AppProvidersProps {
  children: ReactNode;
  authContextValue?: AuthContextType;
}

export const AppProviders = ({
  children,
  authContextValue,
}: AppProvidersProps) => {
  const authTree = authContextValue ? (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  ) : (
    <AuthProvider>{children}</AuthProvider>
  );

  return (
    <PrimeReactProvider>
      <Provider store={store}>
        <BrowserRouter>{authTree}</BrowserRouter>
      </Provider>
    </PrimeReactProvider>
  );
};
