import { createContext, useContext, useState, type ReactNode } from "react";
import type { MockUser } from "@/data/mockUsers";

interface AuthContextType {
  user: MockUser | null;
  login: (user: MockUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(() => {
    const stored = localStorage.getItem("auth-user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (u: MockUser) => {
    setUser(u);
    localStorage.setItem("auth-user", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth-user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
