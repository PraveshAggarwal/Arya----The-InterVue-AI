import React, { createContext, useContext, useState } from 'react';
import { authService, userService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('intervue_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('intervue_auth') === 'true';
  });

  const login = async (email, password, rememberMe = true) => {
    const res = await authService.login({ email, password });
    const { token, user: userData } = res;
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('intervue_token', token);
    if (rememberMe) {
      localStorage.setItem('intervue_auth', 'true');
      localStorage.setItem('intervue_user', JSON.stringify(userData));
    }
    return { success: true };
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    const { token, user: newUser } = res;
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('intervue_token', token);
    localStorage.setItem('intervue_auth', 'true');
    localStorage.setItem('intervue_user', JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('intervue_token');
    localStorage.removeItem('intervue_auth');
    localStorage.removeItem('intervue_user');
  };

  const updateUser = async (updatedFields) => {
    const res = await userService.updateProfile(updatedFields);
    const updated = res.data;
    setUser(updated);
    localStorage.setItem('intervue_user', JSON.stringify(updated));
    return updated;
  };

  const refreshUser = async () => {
    try {
      const res = await userService.getProfile();
      setUser(res.data);
      localStorage.setItem('intervue_user', JSON.stringify(res.data));
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
