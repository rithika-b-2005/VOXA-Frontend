'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  isPremium?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchProfile(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchProfile = async (authToken: string) => {
    const { data, error } = await authApi.getProfile();
    if (data && !error) {
      setUser(data);
    } else {
      localStorage.removeItem('token');
      setToken(null);
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await authApi.login({ email, password });
    if (error) {
      return { success: false, error };
    }
    if (data) {
      localStorage.setItem('token', data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);
      return { success: true };
    }
    return { success: false, error: 'Unknown error' };
  };

  const register = async (registerData: { email: string; password: string; firstName?: string; lastName?: string }) => {
    const { data, error } = await authApi.register(registerData);
    if (error) {
      return { success: false, error };
    }
    if (data) {
      localStorage.setItem('token', data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);
      return { success: true };
    }
    return { success: false, error: 'Unknown error' };
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refetchUser = async () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      await fetchProfile(storedToken);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refetchUser }}>
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
