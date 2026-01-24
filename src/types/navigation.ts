// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Tipos de navegación
// Definición de tipos para TypeScript
// ═══════════════════════════════════════════════════════════════════════════

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// ═══════════════════════════════════════════════════════════════════════════
// STACK DE AUTENTICACIÓN
// ═══════════════════════════════════════════════════════════════════════════

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  VerifyEmail: { email: string };
};

// ═══════════════════════════════════════════════════════════════════════════
// TABS PRINCIPALES
// ═══════════════════════════════════════════════════════════════════════════

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  MapTab: NavigatorScreenParams<MapStackParamList>;
  AlertsTab: NavigatorScreenParams<AlertsStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// ═══════════════════════════════════════════════════════════════════════════
// STACK DE HOME
// ═══════════════════════════════════════════════════════════════════════════

export type HomeStackParamList = {
  Home: undefined;
  VitalDetail: { 
    type?: 'heartRate' | 'oxygen' | 'temperature' | 'bloodPressure' | 'steps';
    vitalType?: 'heartRate' | 'oxygen' | 'temperature' | 'bloodPressure' | 'steps';
    deviceId: string;
  };
  DeviceDetail: { deviceId: string };
  LinkDevice: undefined;
  ScanQR: undefined;
  Emergency: undefined;
  AddMonitored: undefined;
  MonitoredPerson: { personId: string };
};

// ═══════════════════════════════════════════════════════════════════════════
// STACK DE MAPA
// ═══════════════════════════════════════════════════════════════════════════

export type MapStackParamList = {
  Map: undefined;
  LocationHistory: { deviceId: string };
  GeofenceSettings: { deviceId?: string } | undefined;
};

// ═══════════════════════════════════════════════════════════════════════════
// STACK DE ALERTAS
// ═══════════════════════════════════════════════════════════════════════════

export type AlertsStackParamList = {
  Alerts: undefined;
  AlertDetail: { alertId: string };
  AlertSettings: undefined;
};

// ═══════════════════════════════════════════════════════════════════════════
// STACK DE PERFIL
// ═══════════════════════════════════════════════════════════════════════════

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  MonitoredPerson: { personId: string };
  EditMonitoredPerson: { personId?: string };
  MedicalInfo: { personId: string };
  EmergencyContacts: { personId: string };
  AddEmergencyContact: { personId: string; contactId?: string };
  Settings: undefined;
  NotificationSettings: undefined;
  Security: undefined;
  Help: undefined;
  DeviceManagement: undefined;
  About: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
};

// ═══════════════════════════════════════════════════════════════════════════
// ROOT NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Onboarding: undefined;
};

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS DE PROPS PARA SCREENS
// ═══════════════════════════════════════════════════════════════════════════

// Auth Stack
export type WelcomeScreenProps = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;
export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;
export type ForgotPasswordScreenProps = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

// Home Stack
export type HomeScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Home'>,
  BottomTabScreenProps<MainTabParamList>
>;
export type VitalDetailScreenProps = NativeStackScreenProps<HomeStackParamList, 'VitalDetail'>;
export type DeviceDetailScreenProps = NativeStackScreenProps<HomeStackParamList, 'DeviceDetail'>;
export type LinkDeviceScreenProps = NativeStackScreenProps<HomeStackParamList, 'LinkDevice'>;
export type EmergencyScreenProps = NativeStackScreenProps<HomeStackParamList, 'Emergency'>;

// Map Stack
export type MapScreenProps = CompositeScreenProps<
  NativeStackScreenProps<MapStackParamList, 'Map'>,
  BottomTabScreenProps<MainTabParamList>
>;
export type LocationHistoryScreenProps = NativeStackScreenProps<MapStackParamList, 'LocationHistory'>;

// Alerts Stack
export type AlertsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AlertsStackParamList, 'Alerts'>,
  BottomTabScreenProps<MainTabParamList>
>;
export type AlertDetailScreenProps = NativeStackScreenProps<AlertsStackParamList, 'AlertDetail'>;

// Profile Stack
export type ProfileScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'Profile'>,
  BottomTabScreenProps<MainTabParamList>
>;
export type EditProfileScreenProps = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;
export type MonitoredPersonScreenProps = NativeStackScreenProps<ProfileStackParamList, 'MonitoredPerson'>;
export type SettingsScreenProps = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

// ═══════════════════════════════════════════════════════════════════════════
// DECLARACIÓN GLOBAL PARA REACT NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
