import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/endpoints';
import { tokenStorage } from './storage';
import { setOnAuthExpired } from '../api/client';

const AuthContext = createContext(null);

const normaliseUser = (u) =>
  u ? { ...u, role: String(u.role || '').toLowerCase() } : null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Hook the API client up to our "force logout" on unrecoverable 401.
  useEffect(() => {
    setOnAuthExpired(async () => {
      await tokenStorage.clear();
      setUser(null);
    });
  }, []);

  // On app launch, try to use stored tokens.
  useEffect(() => {
    (async () => {
      try {
        const access = await tokenStorage.getAccess();
        if (!access) {
          setReady(true);
          return;
        }
        const { user: me } = await authApi.me();
        setUser(normaliseUser(me));
      } catch {
        await tokenStorage.clear();
        setUser(null);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const login = async (email, password) => {
    try {
      const { user: u, tokens } = await authApi.login(email, password);
      if (tokens) await tokenStorage.save(tokens);
      const normalised = normaliseUser(u);
      setUser(normalised);
      return { success: true, user: normalised };
    } catch (err) {
      return { success: false, error: err?.message || 'Login failed' };
    }
  };

  const signup = async (payload) => {
    try {
      const { user: u, tokens } = await authApi.signup(payload);
      if (tokens) await tokenStorage.save(tokens);
      const normalised = normaliseUser(u);
      setUser(normalised);
      return { success: true, user: normalised };
    } catch (err) {
      return { success: false, error: err?.message || 'Signup failed' };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = await tokenStorage.getRefresh();
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      // best effort
    }
    await tokenStorage.clear();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, ready, login, signup, logout, setUser }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
