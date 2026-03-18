import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth as apiAuth, user as apiUser, AuthUser } from "@/api";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (nickname: string, password: string) => Promise<AuthUser>;
  register: (nickname: string, password: string, adminSecret?: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!apiAuth.isLoggedIn()) {
      setLoading(false);
      return;
    }
    apiUser
      .me()
      .then((u) => setCurrentUser(u))
      .catch(() => {
        apiAuth.logout();
        setCurrentUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (nickname: string, password: string): Promise<AuthUser> => {
    const { user } = await apiAuth.login(nickname, password);
    setCurrentUser(user);
    return user;
  };

  const register = async (
    nickname: string,
    password: string,
    adminSecret?: string
  ): Promise<AuthUser> => {
    const { user } = await apiAuth.register(nickname, password, adminSecret);
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    apiAuth.logout();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ user: currentUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};