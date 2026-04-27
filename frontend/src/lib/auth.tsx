/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCurrentUser, logout as logoutApi } from "../../apis/auth-apis";

type SessionUser = {
  uid: string;
  email?: string | null;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: SessionUser | null;
  refreshSession: () => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<SessionUser | null>(null);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const data = await getCurrentUser();
      if (typeof data.uid !== "string" || !data.uid) {
        setUser(null);
        return false;
      }
      setUser({
        uid: data.uid,
        email: typeof data.email === "string" ? data.email : null,
      });
      return true;
    } catch {
      setUser(null);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutApi();
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await refreshSession();
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: !!user,
      isLoading,
      user,
      refreshSession,
      logout,
    }),
    [isLoading, refreshSession, user, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
