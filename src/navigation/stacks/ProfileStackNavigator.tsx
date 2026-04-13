// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Stack Navigator Perfil
// Navegación de la sección de perfil y configuración
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types/navigation';

// Screens
import ProfileScreen from '../../screens/main/profile/ProfileScreen';
import EditProfileScreen from '../../screens/main/profile/EditProfileScreen';
import SettingsScreen from '../../screens/main/profile/SettingsScreen';
import NotificationSettingsScreen from '../../screens/main/profile/NotificationSettingsScreen';
import SecurityScreen from '../../screens/main/profile/SecurityScreen';
import HelpScreen from '../../screens/main/profile/HelpScreen';
import AboutScreen from '../../screens/main/profile/AboutScreen';
import TermsOfServiceScreen from '../../screens/main/profile/TermsOfServiceScreen';

// ═══════════════════════════════════════════════════════════════════════════
// STACK NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Profile"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;
