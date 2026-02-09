import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
import MerchantBusinessSetupScreen from '../screens/auth/MerchantBusinessSetupScreen';
import MerchantPaymentSetupScreen from '../screens/auth/MerchantPaymentSetupScreen';
import CourierDocumentSetupScreen from '../screens/auth/CourierDocumentSetupScreen';
import CourierPaymentSetupScreen from '../screens/auth/CourierPaymentSetupScreen';
import VerificationPendingScreen from '../screens/auth/VerificationPendingScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      contentStyle: { flex: 1 },
    }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="MerchantBusinessSetup" component={MerchantBusinessSetupScreen} />
      <Stack.Screen name="MerchantPaymentSetup" component={MerchantPaymentSetupScreen} />
      <Stack.Screen name="CourierDocumentSetup" component={CourierDocumentSetupScreen} />
      <Stack.Screen name="CourierPaymentSetup" component={CourierPaymentSetupScreen} />
      <Stack.Screen name="VerificationPending" component={VerificationPendingScreen} />
    </Stack.Navigator>
  );
}
