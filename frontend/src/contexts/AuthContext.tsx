import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, usersAPI, notificationsAPI, saveTokens, loadTokens, clearTokens } from '../services/api';
import { Platform } from 'react-native';

type UserRole = 'customer' | 'business_owner' | 'driver' | 'admin';

interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { access } = await loadTokens();
      if (access) {
        const profile = await usersAPI.getProfile();
        setUser(profile);
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      await clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const registerPushToken = async () => {
    try {
      // Dynamic imports to avoid build errors if packages not installed
      const Notifications = require('expo-notifications');
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;
      const tokenData = await Notifications.getExpoPushTokenAsync();
      await notificationsAPI.registerDevice(
        tokenData.data,
        Platform.OS,
        undefined,
      );
    } catch (err) {
      // Push registration is optional — skip silently if packages unavailable
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    await saveTokens(response.access_token, response.refresh_token);
    setUser(response.user);
    registerPushToken();
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
  }) => {
    const response = await authAPI.register(data);
    await saveTokens(response.access_token, response.refresh_token);
    setUser(response.user);
  };

  const logout = async () => {
    await clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        setUser,
      }}
    >
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
