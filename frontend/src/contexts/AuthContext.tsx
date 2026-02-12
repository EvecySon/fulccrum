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
  login: (email: string, password: string) => Promise<any>;
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
      const { access, refresh } = await loadTokens();
      if (!access) {
        console.log('[Auth] No stored token found');
        return;
      }
      console.log('[Auth] Token loaded, restoring session...');

      // Check if biometric is enabled (skip on web — no hardware)
      if (Platform.OS !== 'web') {
        try {
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
                return;
              }
            }
          }
        } catch (bioErr) {
          console.log('[Auth] Biometric check skipped:', bioErr);
        }
      }

      try {
        const profile = await usersAPI.getProfile();
        setUser(profile);
        console.log('[Auth] Session restored for', profile?.email);
      } catch (profileErr: any) {
        console.log('[Auth] getProfile failed, status:', profileErr?.status);
        // If 401, the request() wrapper already tried refresh token.
        // Only clear tokens if we truly can't recover.
        if (profileErr?.status === 401) {
          console.log('[Auth] Token expired and refresh failed, clearing');
          await clearTokens();
        }
        // For other errors (network, 500, etc.) don't clear — keep tokens for retry
      }
    } catch (error) {
      console.log('[Auth] checkAuth error:', error);
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
    
    // Check if account is unverified
    if (response.verified === false) {
      // Return the unverified response so UI can navigate to verification screen
      return response;
    }
    
    // Normal verified login
    await saveTokens(response.accessToken, response.refreshToken);
    setUser(response.user);
    registerPushToken();
    return response;
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
    // Registration doesn't return tokens - user must verify OTP first
    // Return the response so the UI can navigate to verification screen
    return response;
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
