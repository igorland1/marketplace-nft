import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { authService } from '@/services/api';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; username: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('greenmint_auth_token');
      if (token) {
        try {
          const { user } = await authService.me();
          setUser(user);
        } catch {
          // Token expired or invalid
          localStorage.removeItem('greenmint_auth_token');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // Challenge requirement: clear any prior session cache to avoid data leakage between users
    queryClient.clear();
    const data = await authService.login({ email, password });
    localStorage.setItem('greenmint_auth_token', data.token);
    setUser(data.user);
    queryClient.invalidateQueries();
  };

  const register = async (formData: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) => {
    queryClient.clear();
    const data = await authService.register(formData);
    localStorage.setItem('greenmint_auth_token', data.token);
    setUser(data.user);
    queryClient.invalidateQueries();
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('greenmint_auth_token');
      setUser(null);
      // Challenge requirement: clear private cache on logout to avoid leaking state between sessions
      queryClient.clear();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
