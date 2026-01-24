// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Stack Navigator Alertas
// Navegación de la sección de alertas y notificaciones
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AlertsStackParamList } from '../../types/navigation';

// Screens
import AlertsScreen from '../../screens/main/alerts/AlertsScreen';
import AlertDetailScreen from '../../screens/main/alerts/AlertDetailScreen';
import AlertSettingsScreen from '../../screens/main/alerts/AlertSettingsScreen';

// ═══════════════════════════════════════════════════════════════════════════
// STACK NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════

const Stack = createNativeStackNavigator<AlertsStackParamList>();

export const AlertsStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Alerts"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="Alerts" component={AlertsScreen} />
      <Stack.Screen name="AlertDetail" component={AlertDetailScreen} />
      <Stack.Screen 
        name="AlertSettings" 
        component={AlertSettingsScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

export default AlertsStackNavigator;
