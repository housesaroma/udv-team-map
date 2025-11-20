import { createContext } from "react";
import type { AuthContextType } from "./AuthContext";

const fallbackTokenGetter = () => {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  return window.localStorage.getItem("authToken");
};

type TokenGetter = () => string | null;

let tokenGetter: TokenGetter | undefined;

export const setAuthTokenGetter = (getter?: TokenGetter) => {
  tokenGetter = getter;
};

export const getAuthToken = (): string | null => {
  if (tokenGetter) {
    return tokenGetter();
  }
  return fallbackTokenGetter();
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
