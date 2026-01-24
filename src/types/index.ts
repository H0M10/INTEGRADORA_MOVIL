// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Tipos de datos principales
// Modelos de datos para toda la aplicación
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// USUARIO
// ═══════════════════════════════════════════════════════════════════════════

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  photoUrl?: string;
  avatar?: string;             // Alias para photoUrl
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// DISPOSITIVO IoT
// ═══════════════════════════════════════════════════════════════════════════

export interface Device {
  id: string;
  name: string;
  serialNumber: string;
  code: string;
  model: string;
  firmwareVersion: string;
  status: DeviceStatus;
  isActive: boolean;
  isConnected: boolean;
  batteryLevel: number;
  lastSeen: string | null;
  lastSyncAt: string | null;
  linkedAt: string;
  monitoredPerson?: MonitoredPerson;
}

export type DeviceStatus = 'connected' | 'disconnected' | 'low_battery' | 'error';

// ═══════════════════════════════════════════════════════════════════════════
// PERSONA MONITOREADA
// ═══════════════════════════════════════════════════════════════════════════

export interface MonitoredPerson {
  id: string;
  userId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  dateOfBirth?: string;           // Alias para birthDate
  age?: number;
  photoUrl?: string;
  profilePhoto?: string;          // Alias para photoUrl
  gender?: 'male' | 'female' | 'other';
  bloodType?: string;
  weight?: number;
  height?: number;
  notes?: string;
  relationship?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  medicalConditions?: MedicalCondition[];
  medications?: Medication[];
  emergencyContacts?: EmergencyContact[];
  device?: Device;
}

export interface Medication {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  notes?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// INFORMACIÓN MÉDICA
// ═══════════════════════════════════════════════════════════════════════════

export interface MedicalCondition {
  id: string;
  monitoredId: string;
  conditionType: 'disease' | 'allergy' | 'medication' | 'surgery' | 'other';
  name: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  diagnosisDate?: string;
  notes?: string;
  isActive: boolean;
}

export interface EmergencyContact {
  id: string;
  monitoredId: string;
  name: string;
  phone: string;
  relationship?: string;
  isPrimary: boolean;
  notifyAlerts: boolean;
  notes?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// SIGNOS VITALES
// ═══════════════════════════════════════════════════════════════════════════

export interface VitalSigns {
  id: string;
  deviceId: string;
  heartRate: number | null;       // BPM
  spo2: number | null;            // % saturación oxígeno
  oxygenLevel: number | null;     // Alias para spo2
  temperature: number | null;     // °C
  systolicBp: number | null;      // mmHg (presión sistólica)
  diastolicBp: number | null;     // mmHg (presión diastólica)
  steps: number;                  // Pasos del día
  calories: number;               // Calorías quemadas
  timestamp: string;              // Alias para recordedAt
  recordedAt: string;
}

export interface VitalSignsHistory {
  data: VitalSigns[];
  period: 'day' | 'week' | 'month';
  deviceId: string;
}

// Umbrales para signos vitales
export interface VitalThresholds {
  heartRate: { min: number; max: number };
  spo2: { min: number };
  temperature: { min: number; max: number };
  systolicBp: { min: number; max: number };
  diastolicBp: { min: number; max: number };
}

export const DEFAULT_VITAL_THRESHOLDS: VitalThresholds = {
  heartRate: { min: 50, max: 120 },
  spo2: { min: 92 },
  temperature: { min: 35, max: 38.5 },
  systolicBp: { min: 90, max: 140 },
  diastolicBp: { min: 60, max: 90 },
};

// ═══════════════════════════════════════════════════════════════════════════
// UBICACIÓN
// ═══════════════════════════════════════════════════════════════════════════

export interface Location {
  id: string;
  deviceId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  address?: string;
  recordedAt: string;
  timestamp: string;            // Alias para recordedAt (requerido)
}

// Alias para compatibilidad
export type DeviceLocation = Location;

export interface Geofence {
  id: string;
  monitoredId: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // metros
  isActive: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERTAS
// ═══════════════════════════════════════════════════════════════════════════

export type AlertType = 
  | 'FALL_DETECTED'
  | 'HIGH_HEART_RATE'
  | 'LOW_HEART_RATE'
  | 'LOW_SPO2'
  | 'HIGH_TEMPERATURE'
  | 'LOW_TEMPERATURE'
  | 'LOW_BATTERY'
  | 'DEVICE_DISCONNECTED'
  | 'GEOFENCE_EXIT'
  | 'SOS_BUTTON'
  | 'heart_rate_high'
  | 'heart_rate_low'
  | 'fall_detected'
  | 'oxygen_low'
  | 'temperature_high'
  | 'temperature_low'
  | 'battery_low'
  | 'low_battery'
  | 'geofence_exit'
  | 'device_offline'
  | 'sos_activated';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Alert {
  id: string;
  deviceId: string;
  type: AlertType;                // Alias para alertType
  alertType: AlertType;
  title: string;
  message: string;
  alertTypeName: string;
  severity: AlertSeverity;
  value?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  isRead: boolean;
  isDismissed: boolean;
  isAttended: boolean;
  attendedAt?: string;
  isFalseAlarm: boolean;
  notes?: string;
  createdAt: string;
  timestamp?: string;              // Alias para createdAt
  data?: Record<string, any>;
  device?: Device;
  monitoredPerson?: MonitoredPerson;
}

export interface AlertStats {
  total: number;
  critical: number;
  warning: number;
  info: number;
  attended: number;
  pending: number;
  unread: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICACIONES
// ═══════════════════════════════════════════════════════════════════════════

export interface Notification {
  id: string;
  userId: string;
  alertId?: string;
  title: string;
  body: string;
  type: 'push' | 'email';  // SMS removido - no viable para el proyecto
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  readAt?: string;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// API RESPONSES
// ═══════════════════════════════════════════════════════════════════════════

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

// ═══════════════════════════════════════════════════════════════════════════
// FORMULARIOS
// ═══════════════════════════════════════════════════════════════════════════

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface LinkDeviceForm {
  code: string;
  monitoredPerson?: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    bloodType?: string;
    phone?: string;
  };
  relationship?: string;
}

export interface MonitoredPersonForm {
  name: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  bloodType?: string;
  weight?: number;
  height?: number;
  notes?: string;
}

export interface EmergencyContactForm {
  name: string;
  phone: string;
  relationship?: string;
  isPrimary: boolean;
  notifyAlerts: boolean;
}

export interface MedicalConditionForm {
  conditionType: 'disease' | 'allergy' | 'medication' | 'surgery' | 'other';
  name: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  diagnosisDate?: string;
  notes?: string;
}
