import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CustomerUser } from "../types";

const STORAGE_KEY = "ticketrush-customer-user";

function loadUser(): CustomerUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CustomerUser;
  } catch {
    return null;
  }
}

type CustomerAuthContextValue = {
  user: CustomerUser | null;
  login: (email: string, password: string) => void;
  logout: () => void;
};

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(() => loadUser());

  const login = useCallback((email: string, _password: string) => {
    const trimmed = email.trim();
    const local = trimmed.split("@")[0] || "Khách";
    const name =
      local.length > 0
        ? local.charAt(0).toUpperCase() + local.slice(1).toLowerCase()
        : "Khách";
    const next: CustomerUser = {
      id: `customer-${Date.now()}`,
      name,
      email: trimmed,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setUser(next);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, login, logout }),
    [user, login, logout],
  );

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  }
  return ctx;
}
