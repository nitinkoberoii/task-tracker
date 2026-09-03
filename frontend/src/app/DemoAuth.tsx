import { createContext, type ReactNode, useContext, useState } from "react";

const DEMO_EMAIL = "demo@tasktracker.local";
const DEMO_PASSWORD = "demo123";
const STORAGE_KEY = "smart-task-tracker-demo-session";

type DemoAuthValue = {
  isLoggedIn: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
};

const DemoAuthContext = createContext<DemoAuthValue | null>(null);

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem(STORAGE_KEY) === "active");

  function login(email: string, password: string) {
    const isValid = email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;
    if (isValid) {
      localStorage.setItem(STORAGE_KEY, "active");
      setIsLoggedIn(true);
    }
    return isValid;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setIsLoggedIn(false);
  }

  return <DemoAuthContext.Provider value={{ isLoggedIn, login, logout }}>{children}</DemoAuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDemoAuth() {
  const value = useContext(DemoAuthContext);
  if (!value) throw new Error("DemoAuthProvider is required.");
  return value;
}

// eslint-disable-next-line react-refresh/only-export-components
export const demoCredentials = { email: DEMO_EMAIL, password: DEMO_PASSWORD };
