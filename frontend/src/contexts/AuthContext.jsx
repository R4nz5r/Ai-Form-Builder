import { createContext, useCallback, useEffect, useState } from "react";
import { authApi } from "../services/index.js";
import { TOKEN_KEY } from "../lib/api.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from a persisted token on first load.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback(({ user, token }) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
    return user;
  }, []);

  const login = useCallback(
    async (credentials) => persist(await authApi.login(credentials)),
    [persist]
  );

  const register = useCallback(
    async (payload) => persist(await authApi.register(payload)),
    [persist]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  // Merge updated fields (e.g. after a profile edit) into the current user.
  const updateUser = useCallback((patch) => setUser((u) => ({ ...u, ...patch })), []);

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated: !!user, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
