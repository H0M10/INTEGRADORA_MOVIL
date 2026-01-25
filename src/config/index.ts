// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Configuración de la API
// Variables de entorno y configuración base para PRODUCCIÓN
// ═══════════════════════════════════════════════════════════════════════════

import Constants from 'expo-constants';

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 CONFIGURACIÓN DE PRODUCCIÓN - RAILWAY
// ═══════════════════════════════════════════════════════════════════════════
// Backend desplegado en Railway
const RAILWAY_URL = 'backend-production-2148.up.railway.app';
const RAILWAY_PORT = '8080'; // Puerto de Railway

// Para desarrollo local (comentar en producción)
const LOCAL_IP = '10.13.0.8';
const LOCAL_PORT = '8002';
// ═══════════════════════════════════════════════════════════════════════════

// Determinar el entorno - Por defecto PRODUCTION para Play Store
// Cambia a 'development' para pruebas locales
const ENV = Constants.expoConfig?.extra?.env || 'production';

// Configuraciones por entorno
const environments = {
  development: {
    API_BASE_URL: `http://${LOCAL_IP}:${LOCAL_PORT}/api/v1`,
    WS_URL: `ws://${LOCAL_IP}:${LOCAL_PORT}/ws`,
    AWS_REGION: 'us-east-1',
    DEBUG: true,
  },
  staging: {
    API_BASE_URL: `https://${RAILWAY_URL}/api/v1`,
    WS_URL: `wss://${RAILWAY_URL}/ws`,
    AWS_REGION: 'us-east-1',
    DEBUG: true,
  },
  production: {
    API_BASE_URL: `https://${RAILWAY_URL}/api/v1`,
    WS_URL: `wss://${RAILWAY_URL}/ws`,
    AWS_REGION: 'us-east-1',
    DEBUG: false,
  },
};

type Environment = keyof typeof environments;

const currentEnv = environments[ENV as Environment] || environments.development;

export const config = {
  // API
  API_BASE_URL: currentEnv.API_BASE_URL,
  WS_URL: currentEnv.WS_URL,
  API_TIMEOUT: 30000, // 30 segundos

  // AWS
  AWS_REGION: currentEnv.AWS_REGION,

  // App
  APP_NAME: 'NovaGuardian',
  APP_VERSION: Constants.expoConfig?.version || '1.0.0',
  BUILD_NUMBER: Constants.expoConfig?.ios?.buildNumber || '1',

  // Debug
  DEBUG: currentEnv.DEBUG,

  // Intervalos de actualización (en milisegundos)
  VITALS_REFRESH_INTERVAL: 10000,      // 10 segundos
  LOCATION_REFRESH_INTERVAL: 30000,    // 30 segundos
  ALERTS_REFRESH_INTERVAL: 15000,      // 15 segundos
  DEVICE_STATUS_INTERVAL: 60000,       // 1 minuto

  // Almacenamiento - SecureStore solo permite alfanuméricos, ".", "-" y "_"
  STORAGE_KEYS: {
    AUTH_TOKEN: 'novaguardian.auth_token',
    REFRESH_TOKEN: 'novaguardian.refresh_token',
    USER_DATA: 'novaguardian.user_data',
    ONBOARDING_COMPLETE: 'novaguardian.onboarding_complete',
    NOTIFICATION_SETTINGS: 'novaguardian.notification_settings',
    THEME_PREFERENCE: 'novaguardian.theme_preference',
  },

  // Mapas
  MAPS: {
    DEFAULT_LATITUDE: 19.4326,  // CDMX
    DEFAULT_LONGITUDE: -99.1332,
    DEFAULT_ZOOM: 15,
    DEFAULT_GEOFENCE_RADIUS: 100, // metros
  },

  // Alias para mapas (compatibilidad)
  map: {
    defaultLocation: {
      latitude: 19.4326,
      longitude: -99.1332,
    },
    defaultZoom: 15,
    defaultGeofenceRadius: 100,
  },

  // Límites
  LIMITS: {
    MAX_DEVICES_PER_USER: 5,
    MAX_EMERGENCY_CONTACTS: 5,
    MAX_MEDICAL_CONDITIONS: 20,
    PASSWORD_MIN_LENGTH: 8,
    PHONE_LENGTH: 10,
  },

  // Formatos
  FORMATS: {
    DATE: 'DD/MM/YYYY',
    TIME: 'HH:mm',
    DATETIME: 'DD/MM/YYYY HH:mm',
    DATETIME_FULL: 'DD [de] MMMM [de] YYYY, HH:mm',
  },
};

export default config;
