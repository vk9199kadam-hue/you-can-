import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { onAuthChange, getUserProfile, logoutUser } from "../firebase/auth";
import { IS_AUTH_BYPASS, MOCK_USER_PROFILE } from "../config/devAuth";
import type { UserProfile } from "../types";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  setUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() =>
    IS_AUTH_BYPASS
      ? { ...MOCK_USER_PROFILE, createdAt: new Date(MOCK_USER_PROFILE.createdAt) }
      : null,
  );
  const [loading, setLoading] = useState(() => !IS_AUTH_BYPASS);

  useEffect(() => {
    if (IS_AUTH_BYPASS) {
      return;
    }
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    if (IS_AUTH_BYPASS) {
      setUser(null);
      return;
    }
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
