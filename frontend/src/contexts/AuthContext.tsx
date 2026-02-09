import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, usersAPI, notificationsAPI, saveTokens, loadTokens, clearTokens } from '../services/api';
import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  biometricEnabled: boolean;
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
  toggleBiometric: (enabled: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BIOMETRIC_KEY = 'biometric_enabled';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { access } = await loadTokens();
      if (!access) return;

      // Check if biometric is enabled for this device
      const bioEnabled = await AsyncStorage.getItem(BIOMETRIC_KEY);
      setBiometricEnabled(bioEnabled === 'true');

      if (bioEnabled === 'true') {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (compatible && enrolled) {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Authenticate to continue',
            fallbackLabel: 'Use password',
            disableDeviceFallback: false,
          });
          if (!result.success) {
            // User cancelled biometric — don't auto-login but don't clear tokens
            return;
          }
        }
      }

      const profile = await usersAPI.getProfile();
      setUser(profile);
    } catch (error) {
      console.log('Auth check failed:', error);
      await clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBiometric = async (enabled: boolean) => {
    if (enabled) {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!compatible || !enrolled) {
        throw new Error('Biometric authentication is not available on this device');
      }
    }
    await AsyncStorage.setItem(BIOMETRIC_KEY, enabled ? 'true' : 'false');
    setBiometricEnabled(enabled);
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
    await saveTokens(response.accessToken, response.refreshToken);
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
    await saveTokens(response.accessToken, response.refreshToken);
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
        biometricEnabled,
        login,
        register,
        logout,
        setUser,
        toggleBiometric,
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
