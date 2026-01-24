// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Navegador de Autenticación
// Stack Navigator para pantallas de login y registro
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation';

// Screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// ═══════════════════════════════════════════════════════════════════════════
// STACK NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen}
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
