// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Navegador Principal (Root)
// Gestiona la navegación entre Auth, Onboarding y Main basado en estado
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuthStore } from '../stores';

// Navigators
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';

// Screens
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';

// ═══════════════════════════════════════════════════════════════════════════
// STACK NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  // Solo obtenemos el estado, checkAuth ya se llamó en App.tsx
  const { isAuthenticated, needsOnboarding } = useAuthStore();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        gestureEnabled: false,
      }}
    >
      {!isAuthenticated ? (
        // Usuario no autenticado: Mostrar pantallas de auth
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator}
          options={{
            animationTypeForReplace: 'pop',
          }}
        />
      ) : needsOnboarding ? (
        // Usuario autenticado pero necesita onboarding
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{
            animationTypeForReplace: 'push',
          }}
        />
      ) : (
        // Usuario autenticado y onboarding completado
        <Stack.Screen 
          name="Main" 
          component={MainTabNavigator}
          options={{
            animationTypeForReplace: 'push',
          }}
        />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
