// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Stack Navigator Home
// Navegación de la sección principal/dashboard
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../types/navigation';

// Screens
import HomeScreen from '../../screens/main/home/HomeScreen';
import VitalDetailScreen from '../../screens/main/home/VitalDetailScreen';
import DeviceDetailScreen from '../../screens/main/home/DeviceDetailScreen';
import MonitoredPersonScreen from '../../screens/main/home/MonitoredPersonScreen';
import AddMonitoredScreen from '../../screens/main/home/AddMonitoredScreen';

// ═══════════════════════════════════════════════════════════════════════════
// STACK NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="VitalDetail" component={VitalDetailScreen} />
      <Stack.Screen name="DeviceDetail" component={DeviceDetailScreen} />
      <Stack.Screen name="MonitoredPerson" component={MonitoredPersonScreen} />
      <Stack.Screen 
        name="AddMonitored" 
        component={AddMonitoredScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
