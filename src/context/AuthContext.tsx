/**
 * AuthContext — Local Demo Auth
 *
 * Replaces Firebase Auth for the local development demo.
 * Uses POST /api/auth/demo-login and stores the user in localStorage.
 *
 * The original Firebase-based AuthContext has been preserved in git history.
 * This version is active for the local Node.js backend demo.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, localAuth, ApiUser } from '../services/api';

interface AuthContextType {
  user: ApiUser | null;
  isLoadingAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // On mount: restore session from localStorage
  useEffect(() => {
    const saved = localAuth.load();
    if (saved) setUser(saved);
    setIsLoadingAuth(false);
  }, []);

  const login = async (email: string, password: string) => {
    const apiUser = await authApi.demoLogin(email, password);
    localAuth.save(apiUser);
    setUser(apiUser);
  };

  const logout = async () => {
    localAuth.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoadingAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
