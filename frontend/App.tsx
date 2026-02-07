import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import AppSwitcher from './src/navigation/AppSwitcher';

// Set to false to require login before accessing the app
const DEV_SKIP_AUTH = true;

const prefix = Linking.createURL('/');

const linking: LinkingOptions<any> = {
  prefixes: [prefix, 'fulccrum://', 'https://fulccrum.com'],
  config: {
    screens: {
      // Auth screens
      Login: 'login',
      Register: 'register',
      ForgotPassword: 'forgot-password',
      OTPVerification: 'verify-otp',
      // Customer screens
      OrderTracking: 'order/:orderId',
      Restaurant: 'restaurant/:id',
      // Shared
      ResetPassword: 'reset-password',
    },
  },
};

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading && !DEV_SKIP_AUTH) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  if (DEV_SKIP_AUTH || isAuthenticated) {
    return <AppSwitcher />;
  }

  return <AuthNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer linking={linking}>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
