import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import AppSwitcher from './src/navigation/AppSwitcher';

// Set to false to require login before accessing the app
const DEV_SKIP_AUTH = true;

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
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
