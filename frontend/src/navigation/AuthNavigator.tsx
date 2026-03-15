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

// Provider Registration Screens
import ProviderTypeSelectionScreen from '../screens/provider/auth/ProviderTypeSelectionScreen';
import RestaurantBasicInfoScreen from '../screens/provider/registration/restaurant/RestaurantBasicInfoScreen';
import RestaurantLocationScreen from '../screens/provider/registration/restaurant/RestaurantLocationScreen';
import RestaurantDocumentsScreen from '../screens/provider/registration/restaurant/RestaurantDocumentsScreen';
import RestaurantMenuScreen from '../screens/provider/registration/restaurant/RestaurantMenuScreen';
import ServiceCategoryScreen from '../screens/provider/registration/service/ServiceCategoryScreen';
import ServiceDetailsScreen from '../screens/provider/registration/service/ServiceDetailsScreen';
import ServicePricingScreen from '../screens/provider/registration/service/ServicePricingScreen';
import StoreSetupScreen from '../screens/provider/registration/seller/StoreSetupScreen';
import ProductCategoriesScreen from '../screens/provider/registration/seller/ProductCategoriesScreen';
import AddProductsScreen from '../screens/provider/registration/seller/AddProductsScreen';
import HealthProfessionScreen from '../screens/provider/registration/health/HealthProfessionScreen';
import HealthCredentialsScreen from '../screens/provider/registration/health/HealthCredentialsScreen';
import HealthScheduleScreen from '../screens/provider/registration/health/HealthScheduleScreen';
import HomeServiceTypeScreen from '../screens/provider/registration/home-service/HomeServiceTypeScreen';
import HomeServicePricingScreen from '../screens/provider/registration/home-service/HomeServicePricingScreen';
import HomeServiceAreasScreen from '../screens/provider/registration/home-service/HomeServiceAreasScreen';
import PendingApprovalScreen from '../screens/provider/shared/PendingApprovalScreen';

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
      
      {/* Provider Registration Flow */}
      <Stack.Screen name="ProviderTypeSelection" component={ProviderTypeSelectionScreen} />
      <Stack.Screen name="RestaurantRegistration" component={RestaurantBasicInfoScreen} />
      <Stack.Screen name="RestaurantLocation" component={RestaurantLocationScreen} />
      <Stack.Screen name="RestaurantDocuments" component={RestaurantDocumentsScreen} />
      <Stack.Screen name="RestaurantMenu" component={RestaurantMenuScreen} />
      <Stack.Screen name="ServiceRegistration" component={ServiceCategoryScreen} />
      <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
      <Stack.Screen name="ServicePricing" component={ServicePricingScreen} />
      <Stack.Screen name="SellerRegistration" component={StoreSetupScreen} />
      <Stack.Screen name="ProductCategories" component={ProductCategoriesScreen} />
      <Stack.Screen name="AddProducts" component={AddProductsScreen} />
      <Stack.Screen name="HealthRegistration" component={HealthProfessionScreen} />
      <Stack.Screen name="HealthCredentials" component={HealthCredentialsScreen} />
      <Stack.Screen name="HealthSchedule" component={HealthScheduleScreen} />
      <Stack.Screen name="HomeServiceRegistration" component={HomeServiceTypeScreen} />
      <Stack.Screen name="HomeServicePricing" component={HomeServicePricingScreen} />
      <Stack.Screen name="HomeServiceAreas" component={HomeServiceAreasScreen} />
      <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
    </Stack.Navigator>
  );
}
