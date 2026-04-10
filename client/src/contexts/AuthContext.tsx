import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Manager } from '../types';

interface AuthContextValue {
  manager: Manager | null;
  token: string | null;
  login: (token: string, manager: Manager) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [manager, setManager] = useState<Manager | null>(() => {
    const raw = localStorage.getItem('manager');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
    if (manager) localStorage.setItem('manager', JSON.stringify(manager));
    else localStorage.removeItem('manager');
  }, [manager]);

  function login(t: string, m: Manager) {
    setToken(t);
    setManager(m);
  }

  function logout() {
    setToken(null);
    setManager(null);
  }

  return <AuthContext.Provider value={{ manager, token, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
