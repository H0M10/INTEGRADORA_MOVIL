// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Navegador Principal con Tabs
// Tab Navigator con las secciones principales de la app
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, shadows } from '../theme/spacing';

// Stack Navigators
import HomeStackNavigator from './stacks/HomeStackNavigator';
import MapStackNavigator from './stacks/MapStackNavigator';
import AlertsStackNavigator from './stacks/AlertsStackNavigator';
import ProfileStackNavigator from './stacks/ProfileStackNavigator';

// Stores
import { useAlertStore } from '../stores';

// ═══════════════════════════════════════════════════════════════════════════
// TAB NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════

const Tab = createBottomTabNavigator<MainTabParamList>();

// Iconos para cada tab
type TabIconName = keyof typeof Ionicons.glyphMap;

interface TabIconConfig {
  focused: TabIconName;
  unfocused: TabIconName;
}

const tabIcons: Record<keyof MainTabParamList, TabIconConfig> = {
  HomeTab: { focused: 'home', unfocused: 'home-outline' },
  MapTab: { focused: 'map', unfocused: 'map-outline' },
  AlertsTab: { focused: 'notifications', unfocused: 'notifications-outline' },
  ProfileTab: { focused: 'person', unfocused: 'person-outline' },
};

const tabLabels: Record<keyof MainTabParamList, string> = {
  HomeTab: 'Inicio',
  MapTab: 'Mapa',
  AlertsTab: 'Alertas',
  ProfileTab: 'Perfil',
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE DE ÍCONO CON BADGE
// ═══════════════════════════════════════════════════════════════════════════

interface TabIconProps {
  route: keyof MainTabParamList;
  focused: boolean;
  color: string;
  size: number;
}

const TabIcon: React.FC<TabIconProps> = ({ route, focused, color, size }) => {
  const pendingAlertsCount = useAlertStore((state) => state.pendingCount);
  const iconConfig = tabIcons[route];
  const iconName = focused ? iconConfig.focused : iconConfig.unfocused;

  return (
    <View style={styles.iconContainer}>
      <Ionicons name={iconName} size={size} color={color} />
      {route === 'AlertsTab' && pendingAlertsCount > 0 && (
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
        </View>
      )}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export const MainTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon
            route={route.name as keyof MainTabParamList}
            focused={focused}
            color={color}
            size={size}
          />
        ),
        tabBarLabel: tabLabels[route.name as keyof MainTabParamList],
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 70 + insets.bottom,
            paddingBottom: insets.bottom + 5,
          },
        ],
        tabBarItemStyle: styles.tabBarItem,
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} />
      <Tab.Screen name="MapTab" component={MapStackNavigator} />
      <Tab.Screen name="AlertsTab" component={AlertsStackNavigator} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.ui.border,
    paddingTop: spacing.sm,
    ...shadows.md,
  },
  tabBarLabel: {
    ...typography.caption,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  tabBarItem: {
    paddingTop: spacing.xs,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
  },
  badgeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.status.error,
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
});

export default MainTabNavigator;
