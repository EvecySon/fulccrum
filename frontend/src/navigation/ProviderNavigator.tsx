import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Auth Screens
import ProviderTypeSelectionScreen from '../screens/provider/auth/ProviderTypeSelectionScreen';

// Restaurant Registration
import RestaurantBasicInfoScreen from '../screens/provider/registration/restaurant/RestaurantBasicInfoScreen';
import RestaurantLocationScreen from '../screens/provider/registration/restaurant/RestaurantLocationScreen';
import RestaurantDocumentsScreen from '../screens/provider/registration/restaurant/RestaurantDocumentsScreen';
import RestaurantMenuScreen from '../screens/provider/registration/restaurant/RestaurantMenuScreen';

// Service Provider Registration
import ServiceCategoryScreen from '../screens/provider/registration/service/ServiceCategoryScreen';
import ServiceDetailsScreen from '../screens/provider/registration/service/ServiceDetailsScreen';
import ServicePricingScreen from '../screens/provider/registration/service/ServicePricingScreen';

// Seller Registration
import StoreSetupScreen from '../screens/provider/registration/seller/StoreSetupScreen';
import ProductCategoriesScreen from '../screens/provider/registration/seller/ProductCategoriesScreen';
import AddProductsScreen from '../screens/provider/registration/seller/AddProductsScreen';

// Health Service Registration
import HealthProfessionScreen from '../screens/provider/registration/health/HealthProfessionScreen';
import HealthCredentialsScreen from '../screens/provider/registration/health/HealthCredentialsScreen';
import HealthScheduleScreen from '../screens/provider/registration/health/HealthScheduleScreen';

// Home Service Registration
import HomeServiceTypeScreen from '../screens/provider/registration/home-service/HomeServiceTypeScreen';
import HomeServicePricingScreen from '../screens/provider/registration/home-service/HomeServicePricingScreen';
import HomeServiceAreasScreen from '../screens/provider/registration/home-service/HomeServiceAreasScreen';

// Shared Screens
import PendingApprovalScreen from '../screens/provider/shared/PendingApprovalScreen';

const Stack = createNativeStackNavigator();

const ProviderNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Provider Type Selection */}
      <Stack.Screen 
        name="ProviderTypeSelection" 
        component={ProviderTypeSelectionScreen} 
      />

      {/* Restaurant Registration Flow */}
      <Stack.Screen 
        name="RestaurantRegistration" 
        component={RestaurantBasicInfoScreen} 
      />
      <Stack.Screen 
        name="RestaurantLocation" 
        component={RestaurantLocationScreen} 
      />
      <Stack.Screen 
        name="RestaurantDocuments" 
        component={RestaurantDocumentsScreen} 
      />
      <Stack.Screen 
        name="RestaurantMenu" 
        component={RestaurantMenuScreen} 
      />

      {/* Service Provider Registration Flow */}
      <Stack.Screen 
        name="ServiceRegistration" 
        component={ServiceCategoryScreen} 
      />
      <Stack.Screen 
        name="ServiceDetails" 
        component={ServiceDetailsScreen} 
      />
      <Stack.Screen 
        name="ServicePricing" 
        component={ServicePricingScreen} 
      />

      {/* Seller Registration Flow */}
      <Stack.Screen 
        name="SellerRegistration" 
        component={StoreSetupScreen} 
      />
      <Stack.Screen 
        name="ProductCategories" 
        component={ProductCategoriesScreen} 
      />
      <Stack.Screen 
        name="AddProducts" 
        component={AddProductsScreen} 
      />

      {/* Health Service Registration Flow */}
      <Stack.Screen 
        name="HealthRegistration" 
        component={HealthProfessionScreen} 
      />
      <Stack.Screen 
        name="HealthCredentials" 
        component={HealthCredentialsScreen} 
      />
      <Stack.Screen 
        name="HealthSchedule" 
        component={HealthScheduleScreen} 
      />

      {/* Home Service Registration Flow */}
      <Stack.Screen 
        name="HomeServiceRegistration" 
        component={HomeServiceTypeScreen} 
      />
      <Stack.Screen 
        name="HomeServicePricing" 
        component={HomeServicePricingScreen} 
      />
      <Stack.Screen 
        name="HomeServiceAreas" 
        component={HomeServiceAreasScreen} 
      />

      {/* Shared Screens */}
      <Stack.Screen 
        name="PendingApproval" 
        component={PendingApprovalScreen} 
      />
    </Stack.Navigator>
  );
};

export default ProviderNavigator;
