// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Stack Navigator Mapa
// Navegación de la sección de mapas y ubicación
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MapStackParamList } from '../../types/navigation';

// Screens
import MapScreen from '../../screens/main/map/MapScreen';
import LocationHistoryScreen from '../../screens/main/map/LocationHistoryScreen';
import GeofenceSettingsScreen from '../../screens/main/map/GeofenceSettingsScreen';

// ═══════════════════════════════════════════════════════════════════════════
// STACK NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════

const Stack = createNativeStackNavigator<MapStackParamList>();

export const MapStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Map"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="LocationHistory" component={LocationHistoryScreen} />
      <Stack.Screen 
        name="GeofenceSettings" 
        component={GeofenceSettingsScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

export default MapStackNavigator;
