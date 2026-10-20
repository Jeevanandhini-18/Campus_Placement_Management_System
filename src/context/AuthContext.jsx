import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on load
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('campushire_token');
      const storedUser = localStorage.getItem('campushire_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Failed to parse cached auth state:', err);
      localStorage.removeItem('campushire_token');
      localStorage.removeItem('campushire_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async ({ email, password, role }) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login({ email, password, role });
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('campushire_token', response.token);
      localStorage.setItem('campushire_user', JSON.stringify(response.user));
      return response.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (registrationData) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register(registrationData);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('campushire_token', response.token);
      localStorage.setItem('campushire_user', JSON.stringify(response.user));
      return response.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('campushire_token');
    localStorage.removeItem('campushire_user');
  }, []);

  const updateUserData = useCallback((updatedFields) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('campushire_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        role: user?.role || null,
        isLoading,
        login,
        register,
        logout,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
